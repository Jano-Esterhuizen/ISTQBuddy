namespace ISTQBuddy.Application.Common.Exceptions;

/// <summary>Requested resource does not exist. Maps to HTTP 404.</summary>
public class NotFoundException(string message) : Exception(message);

/// <summary>Authenticated user lacks access to the resource. Maps to HTTP 403.</summary>
public class ForbiddenException(string message) : Exception(message);

/// <summary>Request is invalid for the current state. Maps to HTTP 400/409.</summary>
public class BadRequestException(string message) : Exception(message);
