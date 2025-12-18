{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
    treefmt-nix = {
      inputs.nixpkgs.follows = "nixpkgs";
      url = "github:numtide/treefmt-nix";
    };
    bun2nix = {
      inputs.nixpkgs.follows = "nixpkgs";
      url = "github:nix-community/bun2nix";
    };
  };

  outputs =
    {
      self,
      bun2nix,
      nixpkgs,
      systems,
      treefmt-nix,
      ...
    }:
    let
      eachSystem = f: nixpkgs.lib.genAttrs (import systems) (system: f nixpkgs.legacyPackages.${system});
      treefmtEval = eachSystem (pkgs: treefmt-nix.lib.evalModule pkgs ./treefmt.nix);
      version = if (self ? rev) then self.rev else "dirty";
    in

    {
      formatter = eachSystem (pkgs: treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.wrapper);
      checks = eachSystem (pkgs: {
        formatting = treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.check self;
      });

      devShells = eachSystem (pkgs: {
        default = pkgs.mkShell {
          name = "spetsctf";
          packages = with pkgs; [
            bun
            bun2nix.packages.${stdenv.hostPlatform.system}.default
            curl
            fzf
            getent
            git
            groff
            helix
            jq
            just
            less
            man
            ncurses
            neovim-unwrapped
            nixd
            nixfmt
            npm-check-updates
            openssh
            postgresql.out
            prefetch-npm-deps
            procps
            python3
            ripgrep
            sops
            svelte-language-server
            tmux
            tokei
            typescript-language-server
            uutils-coreutils-noprefix
            vscode-langservers-extracted
          ];

          shellHook = ''
            # ${treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.wrapper}

            export TERM=linux
            export HOME=$(getent passwd $(id -u) | cut -d: -f6)
            export SOPS_EDITOR=nvim

            export PS1='[\[\e[38;5;92m\]spetsctf-dev\[\e[0m\]:\[\e[97m\]\w\[\e[0m\]]\\$ '
          '';
        };

      });

      packages = eachSystem (pkgs: {
        "spetsctf" = pkgs.buildNpmPackage {
          pname = "spetsctf-bundle";
          inherit version;

          nodejs = pkgs.nodejs_22;
          npmDepsHash = "sha256-dwlpXPRPqATB7lI7wsgHL2JOMpPJTuzdPVdbygJy7Bk=";
          # npmDepsHash = pkgs.lib.fakeHash;
          src = pkgs.lib.cleanSource ./.;

          dontNpmInstall = true;
          installPhase = ''
            NODE_ENV=production npm ci # to generate production dependencies
            mkdir $out
            cp -r build/* $out
            cp -r node_modules $out
          '';
        };

      });
    };
}
