# Build aşaması
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Proje dosyalarını kopyala ve bağımlılıkları yükle
COPY ["TaskFlow.Api/TaskFlow.Api.csproj", "TaskFlow.Api/"]
COPY ["TaskFlow.Application/TaskFlow.Application.csproj", "TaskFlow.Application/"]
COPY ["TaskFlow.Core/TaskFlow.Core.csproj", "TaskFlow.Core/"]
COPY ["TaskFlow.Infrastructure/TaskFlow.Infrastructure.csproj", "TaskFlow.Infrastructure/"]
RUN dotnet restore "TaskFlow.Api/TaskFlow.Api.csproj"

# Tüm kaynak kodunu kopyala ve build et
COPY . .
RUN dotnet publish "TaskFlow.Api/TaskFlow.Api.csproj" -c Release -o /app/publish

# Çalışma aşaması (sadece runtime, daha küçük image)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Dosya yükleme klasörü
RUN mkdir -p /app/uploads

COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "TaskFlow.Api.dll"]
