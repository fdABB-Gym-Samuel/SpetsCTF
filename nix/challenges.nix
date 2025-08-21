{pkgs, lib,...}:
{
  systemd.services."test-challenge" = {
    serviceConfig = {
      DynamicUser = true;
      PrivateTmp = true;
      ProtectSystem = "full";
      Type = "simple";
      ProcSubset = "pid";
    };
    script = ''
        cd /tmp
        echo "SPETSCTF{test_234}" > hello.txt
        
        exec ${lib.getExe pkgs.python3} -m http.server 22149
      '';
  };
}
