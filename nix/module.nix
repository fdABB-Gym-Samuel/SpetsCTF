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
  goMigratePackage = pkgs.callPackage ./packaging/go-migrate.nix { };
  systemdServices = config.systemd.services;
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
    systemd.services.spetsctf =
      let
        servicePrerequisites =
          if (builtins.hasAttr "postgresql-setup" systemdServices) then
            [ systemdServices.postgresql-setup.name ]
          else
            [ ];
      in
      {
        after = [ config.systemd.services.postgresql.name ] ++ servicePrerequisites;
        requires = [ config.systemd.services.postgresql.name ] ++ servicePrerequisites;
        wantedBy = [ "multi-user.target" ];
        path = [ pkgs.file ];
        environment = {
          ADDRESS_HEADER = "x-forwarded-for";
          HOST_HEADER = "x-forwarded-host";
          NODE_ENV = "production";
          ORIGIN = cfg.httpOrigin;
          SOCKET_PATH = cfg.socketPath;
          PROTOCOL_HEADER = "x-forwarded-proto";
        };
        serviceConfig = {
          ExecStartPre = pkgs.writeShellScript "spetsctf-exec-start-pre-migrate-up" ''
            DATABASE_URL="$(cat $CREDENTIALS_DIRECTORY/database_url)"
            ${lib.getExe goMigratePackage} -path ${../database/migrations} -database $DATABASE_URL up
          '';
          ExecStart = "${lib.getExe cfg.nodePackage} ${package}";
          SystemCallFilter = "@system-service";
          RestrictAddressFamilies = [
            "AF_UNIX"
            "AF_INET"
            "AF_INET6"
          ];
          UMask = "0117";
          NoNewPrivileges = true;
          DynamicUser = true;
          Group = "spetsctf";
          StateDirectory = "spetsctf";
          RuntimeDirectory = "spetsctf";
          WorkingDirectory = "%S/spetsctf";
          LoadCredential = [
            "database_url:${cfg.postgresConnectionStringFile}"
            "github_client_id:${cfg.github.clientIdFile}"
            "github_client_secret:${cfg.github.clientSecretFile}"
          ];
        };
      };
  };
}
