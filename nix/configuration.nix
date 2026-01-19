{
  config,
  pkgs,
  modulesPath,
  ...
}:
{
  imports = [
    "${modulesPath}/profiles/minimal.nix"
    "${modulesPath}/profiles/perlless.nix"
    "${modulesPath}/profiles/qemu-guest.nix"
    "${modulesPath}/virtualisation/qemu-vm.nix"
  ];

  virtualisation = {
    graphics = false;
    forwardPorts = [
      {
        from = "host";
        host.port = 8080;
        guest.port = 8080;
      }
    ];
  };

  systemd.services.postgresql-setpassword = {
    requires = [
      config.systemd.services.postgresql.name
      "postgresql-setup.service"
    ];
    after = [
      config.systemd.services.postgresql.name
      "postgresql-setup.service"
    ];

    path = [ pkgs.postgresql ];

    serviceConfig = {
      User = "postgres";
    };

    script = ''
      psql -U postgres -c "alter role spetsctf with password '12345678';"
    '';
  };

  services = {
    getty.autologinUser = "root";

    postgresql = {
      enable = true;
      ensureUsers = [
        {
          name = "spetsctf";
          ensureDBOwnership = true;
          ensureClauses.login = true;
        }
      ];
      ensureDatabases = [ "spetsctf" ];
    };

    spetsctf = {
      enable = true;

      httpOrigin = "http://127.0.0.1:8080";

      postgresConnectionStringFile = pkgs.writeText "connection-string" "postgres://spetsctf:12345678@/spetsctf?host=/run/postgresql";

      github = {
        clientIdFile = pkgs.writeText "client-id" "dummy";
        clientSecretFile = pkgs.writeText "client-secret" "dummy";
      };
    };

    nginx = {
      enable = true;
      virtualHosts = {
        "spetsctf" = {
          locations."/" = {
            listen = {
              addr = "0.0.0.0";
              port = 8080;
            };
            proxyPass = "http://unix:/run/spetsctf/http.sock";
          };
        };
      };
    };
  };

  system.stateVersion = "25.11";
}
