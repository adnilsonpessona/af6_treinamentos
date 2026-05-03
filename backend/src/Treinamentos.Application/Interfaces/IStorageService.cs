namespace Treinamentos.Application.Interfaces;

public interface IStorageService
{
    Task<string> SaveVideoAsync(Stream videoStream, string fileName);
    Task<string> SaveThumbnailAsync(Stream imageStream, string fileName);
    Stream GetVideoStream(string videoPath);
    void DeleteFile(string filePath);
    bool FileExists(string filePath);
    long GetFileSize(string filePath);
}
