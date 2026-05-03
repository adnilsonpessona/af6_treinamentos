namespace Treinamentos.Application.DTOs.Auth;

public record ActivateAccountRequest(string Token, string Password, string ConfirmPassword);
