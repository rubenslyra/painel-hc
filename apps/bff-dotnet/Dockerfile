FROM mcr.microsoft.com/dotnet/sdk:10.0 AS builder
WORKDIR /app
COPY src/ src/
RUN dotnet restore src/Painel.Bff/Painel.Bff.csproj
RUN dotnet publish src/Painel.Bff/Painel.Bff.csproj -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=builder /publish .
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 8080
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENTRYPOINT ["docker-entrypoint.sh"]
