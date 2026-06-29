# Etapa 1: Base para construir la aplicacion
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar todos los archivos .csproj para restaurar dependencias
COPY ["SeguraLegal.API/SeguraLegal.API.csproj", "SeguraLegal.API/"]
COPY ["SeguraLegal.Application/SeguraLegal.Application.csproj", "SeguraLegal.Application/"]
COPY ["SeguraLegal.Domain/SeguraLegal.Domain.csproj", "SeguraLegal.Domain/"]
COPY ["SeguraLegal.Infrastructure/SeguraLegal.Infrastructure.csproj", "SeguraLegal.Infrastructure/"]

# Restaurar paquetes NuGet
RUN dotnet restore "SeguraLegal.API/SeguraLegal.API.csproj"

# Copiar el resto del codigo fuente
COPY . .

# Compilar el proyecto principal
WORKDIR "/src/SeguraLegal.API"
RUN dotnet build "SeguraLegal.API.csproj" -c Release -o /app/build

# Publicar la aplicacion
FROM build AS publish
RUN dotnet publish "SeguraLegal.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 2: Imagen final para correr en el servidor de Render
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Iniciar la aplicacion
ENTRYPOINT ["dotnet", "SeguraLegal.API.dll"]
