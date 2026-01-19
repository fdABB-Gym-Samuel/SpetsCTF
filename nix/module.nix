{ self }:
{
  config,
  pkgs,
  lib,
  ...
}:
let
  cfg = config.services.spetsctf;
  package = self.packages.${pkgs.stdenv.hostPlatform.system}.spetsctf;
in
{
  options.services.spetsctf = with lib; {
    enable = mkEnableOption "SpetsCTF web service.";

    httpOrigin = mkOption {
      description = "The value of the ORIGIN environment variable. Required for SvelteKit form submissions.";
      example = "https://ctf.spetsen.net";
      type = types.str;
    };

    postgresConnectionStringFile = mkOption {
      description = "The connection string used by the application.";
      example = "/run/secrets/spetsctf/postgres_connection_string";
      type = types.path;
    };

    github = {
      clientIdFile = mkOption {
        description = "The GitHub OAuth2 client id for authentication.";
        example = "/run/secrets/spetsctf/github/client_id";
        type = types.path;
      };
      clientSecretFile = mkOption {
        description = "The GitHub OAuth2 client secret for authentication.";
        example = "/run/secrets/spetsctf/github/client_secret";
        type = types.path;
      };
    };

    socketPath = mkOption {
      description = "The AF_UNIX socket path where the application will listen, and where you want to point your proxy. Defaults to the systemd runtime directory.";
      example = "/tmp/spetsctf.sock";
      default = "%t/spetsctf/http.sock";
      type = types.oneOf [
        types.path
        types.str
      ];
    };

    nodePackage = mkPackageOption pkgs "nodejs" { };
  };

  config = lib.mkIf cfg.enable {
    systemd.services.spetsctf = {
      after = [ config.systemd.services.postgresql.name ];
      requires = [ config.systemd.services.postgresql.name ];
      wantedBy = [ "multi-user.target" ];
      path = [ pkgs.file ];
      environment = {
        ADDRESS_HEADER = "X-Forwarded-For";
        HOST_HEADER = "X-Forwarded-Host";
        NODE_ENV = "production";
        ORIGIN = cfg.httpOrigin;
        SOCKET_PATH = cfg.socketPath;
        PROTOCOL_HEADER = "X-Forwarded-Proto";
      };
      serviceConfig = {
        ExecStart = "${lib.getExe cfg.nodePackage} ${package}";
        SystemCallFilter = "@system-service";
        RestrictAddressFamilies = "AF_UNIX";
        Umask = "0177";
        NoNewPrivileges = true;
        DynamicUser = true;
        StateDirectory = "spetsctf";
        RuntimeDirectory = "spetsctf";
        WorkingDirectory = "%S/spetsctf";
        LoadCredential = [
          "github_client_id:${cfg.github.clientIdFile}"
          "github_client_secret:${cfg.github.clientSecretFile}"
          "database_url:${cfg.postgresConnectionStringFile}"
        ];
      };
    };
  };
}
