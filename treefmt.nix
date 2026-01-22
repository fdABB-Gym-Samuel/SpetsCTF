{ pkgs, ... }:
let
  prettier-plugin-svelte = pkgs.buildNpmPackage {
    pname = "prettier-plugin-svelte";
    version = "3.4.1";

    src = pkgs.fetchFromGitHub {
      owner = "sveltejs";
      repo = "prettier-plugin-svelte";
      rev = "v3.4.1";
      hash = "sha256-K6NJELgNVs5/hBDps2KHizm/Hk5MKAyRcqTqg/L/gKY=";
    };

    npmDepsHash = "sha256-zJf4gQmd38RUD91XcpymACY5Z7WAk1LFbdo7QCIgYvs=";
    dontNpmPrune = true;

    postInstall = ''
      pushd "$nodeModulesPath"
      find -mindepth 1 -maxdepth 1 -type d -print0 | grep --null-data -Exv "\./(svelte|prettier)" | xargs -0 rm -rfv
      popd
    '';

    meta.license = pkgs.lib.licenses.mit;
  };
  prettier-plugin-tailwindcss = pkgs.buildNpmPackage {
    pname = "prettier-plugin-tailwindcss";
    version = "0.7.2";

    src = pkgs.fetchFromGitHub {
      owner = "tailwindlabs";
      repo = "prettier-plugin-tailwindcss";
      rev = "v0.7.2";
      hash = "sha256-/zRz0mP2P8xX8n0UQmzWt0eYNYA5S4RrD0lRzQYt03M=";
    };

    npmDepsHash = "sha256-J2TTD4rsEG2CYtGWfksbGdTD/yFOX/WeVwaUdlyjuPQ=";
    dontNpmPrune = true;

    meta.license = pkgs.lib.licenses.mit;
  };
in
{
  projectRootFile = "flake.nix";

  programs = {
    deadnix.enable = true;
    dos2unix.enable = true;
    mdformat.enable = true;
    nixfmt.enable = true;
    shfmt.enable = true;
    statix.enable = true;
    yamlfmt.enable = true;
    prettier = {
      enable = true;
      includes = [
        "*.svelte"
        "*.html"
        "*.ts"
        "*.js"
        "*.css"
      ];
      settings = {
        arrowParens = "always";
        bracketSameLine = true;
        bracketSpacing = true;
        plugins = [
          "${prettier-plugin-svelte}/lib/node_modules/prettier-plugin-svelte/plugin.js"
          "${prettier-plugin-tailwindcss}/lib/node_modules/prettier-plugin-tailwindcss/dist/index.mjs"
        ];
        printWidth = 88;
        singleQuote = true;
        tabWidth = 4;
        trailingComma = "es5";
        useTabs = false;
        overrides = [
          {
            files = "*.svelte";
            options = {
              parser = "svelte";
            };
          }
        ];
      };
    };
    sql-formatter = {
      enable = true;
      dialect = "postgresql";
    };
    mbake.enable = true;
  };

}
