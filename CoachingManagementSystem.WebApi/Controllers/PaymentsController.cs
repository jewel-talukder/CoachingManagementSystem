using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CoachingManagementSystem.Application.Interfaces;
using CoachingManagementSystem.Application.DTOs.Payments;
using CoachingManagementSystem.Domain.Entities;

namespace CoachingManagementSystem.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentService _paymentService;

    public PaymentsController(IApplicationDbContext context, IPaymentService paymentService)
    {
        _context = context;
        _paymentService = paymentService;
    }

    [HttpGet]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> GetAll([FromQuery] int? studentId, [FromQuery] int? enrollmentId, [FromQuery] string? status)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var paymentsQuery = _context.Payments
            .Include(p => p.Student)
                .ThenInclude(s => s.User)
            .Include(p => p.Enrollment)
            .Where(p => p.CoachingId == coachingId.Value);

        if (studentId.HasValue)
            paymentsQuery = paymentsQuery.Where(p => p.StudentId == studentId.Value);

        if (enrollmentId.HasValue)
            paymentsQuery = paymentsQuery.Where(p => p.EnrollmentId == enrollmentId.Value);

        if (!string.IsNullOrEmpty(status))
            paymentsQuery = paymentsQuery.Where(p => p.Status == status);

        var payments = await paymentsQuery
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new PaymentDto
            {
                Id = p.Id,
                StudentId = p.StudentId,
                StudentName = $"{p.Student.User.FirstName} {p.Student.User.LastName}",
                EnrollmentId = p.EnrollmentId,
                PaymentType = p.PaymentType,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                TransactionId = p.TransactionId,
                ReceiptNumber = p.ReceiptNumber,
                Remarks = p.Remarks
            })
            .ToListAsync();

        return Ok(payments);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult<PaymentDto>> GetById(int id)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        var payment = await _context.Payments
            .Include(p => p.Student)
                .ThenInclude(s => s.User)
            .Include(p => p.Enrollment)
            .Where(p => p.Id == id && p.CoachingId == coachingId.Value)
            .Select(p => new PaymentDto
            {
                Id = p.Id,
                StudentId = p.StudentId,
                StudentName = $"{p.Student.User.FirstName} {p.Student.User.LastName}",
                EnrollmentId = p.EnrollmentId,
                PaymentType = p.PaymentType,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                TransactionId = p.TransactionId,
                ReceiptNumber = p.ReceiptNumber,
                Remarks = p.Remarks
            })
            .FirstOrDefaultAsync();

        if (payment == null)
            return NotFound(new { message = "Payment not found" });

        return Ok(payment);
    }

    [HttpPost]
    [Authorize(Roles = "Coaching Admin,Super Admin")]
    public async Task<ActionResult> Create([FromBody] CreatePaymentRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Verify student exists
        var student = await _context.Students
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && s.CoachingId == coachingId.Value && !s.IsDeleted);

        if (student == null)
            return NotFound(new { message = "Student not found" });

        Enrollment? enrollment = null;
        if (request.EnrollmentId > 0)
        {
            enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId && e.CoachingId == coachingId.Value);

            if (enrollment == null)
                return NotFound(new { message = "Enrollment not found" });
        }

        // Generate receipt number
        var receiptNumber = $"RCP{DateTime.UtcNow:yyyyMMdd}{new Random().Next(1000, 9999)}";

        var payment = new Payment
        {
            CoachingId = coachingId.Value,
            BranchId = student.BranchId,
            StudentId = request.StudentId,
            EnrollmentId = request.EnrollmentId > 0 ? request.EnrollmentId : null,
            PaymentType = enrollment != null ? "Fee" : "Other",
            Amount = request.Amount,
            PaymentDate = DateTime.UtcNow,
            PaymentMethod = request.PaymentMethod,
            Status = "Completed",
            TransactionId = request.TransactionId,
            ReceiptNumber = receiptNumber,
            Remarks = request.Remarks
        };

        _context.Payments.Add(payment);

        // Update enrollment fee paid if applicable
        if (enrollment != null)
        {
            enrollment.FeePaid += request.Amount;
            enrollment.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = payment.Id }, new PaymentDto
        {
            Id = payment.Id,
            StudentId = payment.StudentId,
            StudentName = $"{student.User.FirstName} {student.User.LastName}",
            EnrollmentId = payment.EnrollmentId,
            PaymentType = payment.PaymentType,
            Amount = payment.Amount,
            PaymentDate = payment.PaymentDate,
            PaymentMethod = payment.PaymentMethod,
            Status = payment.Status,
            TransactionId = payment.TransactionId,
            ReceiptNumber = payment.ReceiptNumber,
            Remarks = payment.Remarks
        });
    }

    [HttpPost("ssl/initiate")]
    [Authorize]
    public async Task<ActionResult> InitiateSslPayment([FromBody] SslPaymentInitRequest request)
    {
        var coachingId = GetCoachingId();
        if (coachingId == null)
            return Unauthorized();

        // Verify enrollment exists
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
                .ThenInclude(s => s.User)
            .Include(e => e.Student)
                .ThenInclude(s => s.Branch)
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.Id == request.EnrollmentId && e.CoachingId == coachingId.Value);

        if (enrollment == null)
            return NotFound(new { message = "Enrollment not found" });

        // Verify student matches
        if (enrollment.StudentId != request.StudentId)
            return BadRequest(new { message = "Student does not match enrollment" });

        // Prepare SSL payment request
        var sslRequest = new SslPaymentInitRequest
        {
            EnrollmentId = request.EnrollmentId,
            StudentId = request.StudentId,
            Amount = request.Amount,
            CustomerName = $"{enrollment.Student.User.FirstName} {enrollment.Student.User.LastName}",
            CustomerEmail = enrollment.Student.User.Email,
            CustomerPhone = enrollment.Student.User.Phone,
            Description = $"Payment for {enrollment.Course.Name} - Enrollment #{enrollment.Id}"
        };

        var response = await _paymentService.InitiateSslPaymentAsync(sslRequest);

        if (!response.Success)
            return BadRequest(new { message = response.Message });

        // Create pending payment record
        var payment = new Payment
        {
            CoachingId = coachingId.Value,
            BranchId = enrollment.Student.BranchId,
            StudentId = request.StudentId,
            EnrollmentId = request.EnrollmentId,
            PaymentType = "Fee",
            Amount = request.Amount,
            PaymentDate = DateTime.UtcNow,
            PaymentMethod = "SSL",
            Status = "Pending",
            TransactionId = response.SessionKey,
            Remarks = sslRequest.Description
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            gatewayUrl = response.GatewayUrl,
            paymentId = payment.Id,
            sessionKey = response.SessionKey
        });
    }

    [HttpPost("ssl-success")]
    [AllowAnonymous]
    public async Task<ActionResult> SslSuccess([FromForm] SslPaymentCallbackRequest request)
    {
        var validation = await _paymentService.ValidateSslPaymentAsync(request);

        if (!validation.Success)
        {
            return Redirect($"{Request.Scheme}://{Request.Host}/payment/failed?message={Uri.EscapeDataString(validation.Message ?? "Validation failed")}");
        }

        // Find payment by transaction ID
        var payment = await _context.Payments
            .Include(p => p.Enrollment)
            .FirstOrDefaultAsync(p => p.TransactionId == request.TranId && p.Status == "Pending");

        if (payment != null)
        {
            payment.Status = "Completed";
            payment.TransactionId = request.TranId;
            payment.UpdatedAt = DateTime.UtcNow;

            // Update enrollment fee paid
            if (payment.Enrollment != null)
            {
                payment.Enrollment.FeePaid += payment.Amount;
                payment.Enrollment.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        return Redirect($"{Request.Scheme}://{Request.Host}/payment/success?transactionId={request.TranId}");
    }

    [HttpPost("ssl-fail")]
    [AllowAnonymous]
    public async Task<ActionResult> SslFail([FromForm] SslPaymentCallbackRequest request)
    {
        // Find payment by transaction ID
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.TransactionId == request.TranId && p.Status == "Pending");

        if (payment != null)
        {
            payment.Status = "Failed";
            payment.TransactionId = request.TranId;
            payment.Remarks = $"Payment failed: {request.Error}";
            payment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        return Redirect($"{Request.Scheme}://{Request.Host}/payment/failed?transactionId={request.TranId}&error={Uri.EscapeDataString(request.Error ?? "Payment failed")}");
    }

    [HttpPost("ssl-cancel")]
    [AllowAnonymous]
    public async Task<ActionResult> SslCancel([FromForm] SslPaymentCallbackRequest request)
    {
        // Find payment by transaction ID
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.TransactionId == request.TranId && p.Status == "Pending");

        if (payment != null)
        {
            payment.Status = "Failed";
            payment.TransactionId = request.TranId;
            payment.Remarks = "Payment cancelled by user";
            payment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        return Redirect($"{Request.Scheme}://{Request.Host}/payment/cancelled?transactionId={request.TranId}");
    }

    [HttpPost("ssl-ipn")]
    [AllowAnonymous]
    public async Task<ActionResult> SslIpn([FromForm] SslPaymentCallbackRequest request)
    {
        // IPN (Instant Payment Notification) - SSLCommerz server-to-server notification
        var validation = await _paymentService.ValidateSslPaymentAsync(request);

        if (validation.Success)
        {
            var payment = await _context.Payments
                .Include(p => p.Enrollment)
                .FirstOrDefaultAsync(p => p.TransactionId == request.TranId);

            if (payment != null && payment.Status == "Pending")
            {
                payment.Status = "Completed";
                payment.TransactionId = request.TranId;
                payment.UpdatedAt = DateTime.UtcNow;

                if (payment.Enrollment != null)
                {
                    payment.Enrollment.FeePaid += payment.Amount;
                    payment.Enrollment.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
            }
        }

        return Ok();
    }

    private int? GetCoachingId()
    {
        var coachingIdClaim = User.FindFirst("coachingId");
        if (coachingIdClaim != null && int.TryParse(coachingIdClaim.Value, out var coachingId))
        {
            return coachingId;
        }
        return null;
    }
}

