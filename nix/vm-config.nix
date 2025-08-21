{...}:
{
  services.openssh = {
    enable = true;
    settings.PermitRootLogin = "yes";
  };
  
  virtualisation.podman.enable = true;  
  virtualisation.oci-containers.backend = "podman";

  networking.firewall.enable = true;
  networking.firewall.allowedTCPPortRanges = [
    {
      from = 20000;
      to = 29999;
    }
  ];
  networking.firewall.allowedUDPPortRanges = [
    {
      from = 20000;
      to = 29999;
    }
  ];
  networking.enableIPv6 = false;
  networking.hostName = "spetsctf";

  users.users."root".openssh.authorizedKeys.keys = [ "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB5Gyc3DfKNsJ9UrF2xXuvsHe1BkvlltxsfUCYLniiqm abbindgym\23eritho@SW2311" ];

  users.mutableUsers = false;

  users.users."ctf" = {
    isNormalUser = true;
    password = "spetsctf";
  };

  imports = [
    ./challenges.nix
  ];

  system.stateVersion = "25.05";
}
