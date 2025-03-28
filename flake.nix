{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    utils,
    nixpkgs,
    ...
  }:
    utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
      version =
        if (self ? rev)
        then self.rev
        else "dirty";
    in rec {
      devShells.default = pkgs.mkShell {
        name = "spetsctf";
        packages = with pkgs; [
          # Node-specific
          nodejs
          nodePackages.npm

          # typescript-specific
          typescript-language-server

          # svelte-specific
          svelte-language-server

          # superhtml
          vscode-langservers-extracted

          # Formatters
          nodePackages.prettier
          alejandra

          # CLI Tools
          ripgrep
          fzf
          git

          # To interact with DB
          postgresql

          helix
          just
        ];

        shellHook = ''
          echo CTF dev session started at $(date)
          export PS1='[\[\e[38;5;27m\]spetsctf-dev\[\e[0m\]:\[\e[38;5;220m\]\w\[\e[0m\]]\\$ '
        '';
      };

      packages."spetsctf" = pkgs.buildNpmPackage {
        pname = "spetsctf-bundle";
        inherit version;

        nodejs = pkgs.nodejs_22;
        npmDepsHash = "sha256-aYn9Fa2ZdtLAVfHs5tXrn5QuCUrWNY9JaoNvMNy0VGk=";
        # npmDepsHash = pkgs.lib.fakeHash;
        src = pkgs.lib.cleanSource ./.;
      };
    });
}
