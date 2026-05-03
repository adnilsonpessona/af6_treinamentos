FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Treinamentos.slnx ./
COPY src/Treinamentos.API/Treinamentos.API.csproj src/Treinamentos.API/
COPY src/Treinamentos.Domain/Treinamentos.Domain.csproj src/Treinamentos.Domain/
COPY src/Treinamentos.Application/Treinamentos.Application.csproj src/Treinamentos.Application/
COPY src/Treinamentos.Infrastructure/Treinamentos.Infrastructure.csproj src/Treinamentos.Infrastructure/

RUN dotnet restore Treinamentos.slnx

COPY src/ src/

RUN dotnet publish src/Treinamentos.API/Treinamentos.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Treinamentos.API.dll"]
