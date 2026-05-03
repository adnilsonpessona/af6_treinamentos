using Microsoft.Extensions.Configuration;
using Treinamentos.Application.Interfaces;

namespace Treinamentos.Infrastructure.Storage;

public class StorageService : IStorageService
{
    private readonly string _videosPath;
    private readonly string _thumbnailsPath;

    public StorageService(IConfiguration config)
    {
        var basePath = config["Videos:StoragePath"] ?? "/videos";
        _videosPath = Path.Combine(basePath, "courses");
        _thumbnailsPath = Path.Combine(basePath, "thumbnails");

        Directory.CreateDirectory(_videosPath);
        Directory.CreateDirectory(_thumbnailsPath);
    }

    public async Task<string> SaveVideoAsync(Stream videoStream, string fileName)
    {
        var safeName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var fullPath = Path.Combine(_videosPath, safeName);

        using var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await videoStream.CopyToAsync(fs);

        return Path.Combine("courses", safeName);
    }

    public async Task<string> SaveThumbnailAsync(Stream imageStream, string fileName)
    {
        var safeName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var fullPath = Path.Combine(_thumbnailsPath, safeName);

        using var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await imageStream.CopyToAsync(fs);

        return Path.Combine("thumbnails", safeName);
    }

    public Stream GetVideoStream(string videoPath)
    {
        var basePath = Path.GetDirectoryName(_videosPath)!;
        var fullPath = Path.Combine(basePath, videoPath);

        if (!File.Exists(fullPath))
            throw new FileNotFoundException("Arquivo de vídeo não encontrado.", fullPath);

        return new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
    }

    public void DeleteFile(string filePath)
    {
        var basePath = Path.GetDirectoryName(_videosPath)!;
        var fullPath = Path.Combine(basePath, filePath);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }

    public bool FileExists(string filePath)
    {
        var basePath = Path.GetDirectoryName(_videosPath)!;
        return File.Exists(Path.Combine(basePath, filePath));
    }

    public long GetFileSize(string filePath)
    {
        var basePath = Path.GetDirectoryName(_videosPath)!;
        var fullPath = Path.Combine(basePath, filePath);
        return new FileInfo(fullPath).Length;
    }
}
