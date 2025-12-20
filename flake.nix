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
            less
            man
            ncurses
            neovim-unwrapped
            nixd
            nixfmt
            npm-check-updates
            openssh
            pdpmake
            postgresql.out
            procps
            ripgrep
            svelte-language-server
            tmux
            tokei
            typescript-language-server
            uutils-coreutils-noprefix
            vscode-langservers-extracted
          ];

          shellHook = ''
            # ${treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.wrapper}

            export DATABASE_URL=postgresql://spetsctf@/spetsctf?host=$(pwd)/tmp
            export HOME=$(getent passwd $(id -u) | cut -d: -f6)
            export PS1='[\[\e[38;5;92m\]spetsctf-dev\[\e[0m\]:\[\e[97m\]\w\[\e[0m\]]\\$ '
            export SOPS_EDITOR=nvim
            export TERM=linux

            alias make='pdpmake --posix'
          '';
        };

      });

      packages = eachSystem (pkgs: rec {
        default = spetsctf;
        spetsctf = bun2nix.packages.${pkgs.stdenv.hostPlatform.system}.default.mkDerivation {
          pname = "spetsctf-bundle";
          inherit version;

          src = pkgs.lib.cleanSource ./.;

          bunDeps = bun2nix.packages.${pkgs.stdenv.hostPlatform.system}.default.fetchBunDeps {
            bunNix = ./bun.nix;
          };

          buildPhase = ''
            bun --bun run build  
          '';

          installPhase = ''
            mkdir -p "$out"
            cp -r "./build/"* "$out"
            cp -r "node_modules" "$out"
          '';
        };
      });
    };
}
