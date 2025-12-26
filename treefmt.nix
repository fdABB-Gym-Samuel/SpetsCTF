{ pkgs, lib, ... }:
let
  prettier-plugin-svelte = pkgs.buildNpmPackage {
    pname = "prettier-plugin-svelte";
    version = "3.3.2";

    src = pkgs.fetchFromGitHub {
      owner = "sveltejs";
      repo = "prettier-plugin-svelte";
      rev = "v3.3.2";
      hash = "sha256-+ThmdCHSiq2xG4Az88oWX++Moh9t7oHmtkZXDzct0Dw=";
    };

    npmDepsHash = "sha256-D+gDdKiIG38jV+M/BqTKf0yYj1KXpbIodtQFdzocpn8=";
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
    version = "0.6.14";

    src = pkgs.fetchFromGitHub {
      owner = "tailwindlabs";
      repo = "prettier-plugin-tailwindcss";
      rev = "v0.6.14";
      hash = "sha256-9zWZIHHDOBJQZZ25B8U3zbdcpsFLORmi5Xg5QCDzQ60=";
    };

    npmDepsHash = "sha256-EozdfUJ50Gy5gXwbf/HHzko0uNG4WjO7DCO920y1fmY=";
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
      settings = {
        arrowParens = "always";
        bracketSameLine = true;
        bracketSpacing = true;
        editorconfig = false;
        plugins = [
          "${prettier-plugin-svelte}/lib/node_modules/prettier-plugin-svelte/plugin.js"
          "${prettier-plugin-tailwindcss}/lib/node_modules/prettier-plugin-tailwindcss/dist/index.mjs"
        ];
        printWidth = 88;
        singleQuote = true;
        tabWidth = 4;
        trailingComma = "es5";
        useTabs = false;
      };
    };
    sql-formatter = {
      enable = true;
      dialect = "postgresql";
    };
  };

  settings.formatter = {
    "mbake" = {
      command = "${lib.getBin pkgs.bash}/bin/bash";
      options = [
        "-euc"
        ''
          for file in "$@"; do
            ${lib.getBin pkgs.mbake}/bin/mbake format $file
          done
        ''
        "--"
      ];
      includes = [
        "Makefile"
      ];
    };
  };
}
