namespace PawFinds.Infrastructure.Adoptions;

public sealed class AdoptionWorkflowException : InvalidOperationException
{
    public AdoptionWorkflowException(string message)
        : base(message)
    {
    }
}
