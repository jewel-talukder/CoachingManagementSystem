using CoachingManagementSystem.Application.DTOs.Payments;

namespace CoachingManagementSystem.Application.Interfaces;

public interface IPaymentService
{
    Task<SslPaymentInitResponse> InitiateSslPaymentAsync(SslPaymentInitRequest request);
    Task<SslPaymentValidationResponse> ValidateSslPaymentAsync(SslPaymentCallbackRequest request);
}

