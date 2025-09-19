{pkgs, ...}: let
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

    meta = {
      license = pkgs.lib.licenses.mit;
    };
  };
in {
  projectRootFile = "flake.nix";

  programs.prettier = {
    enable = true;
    settings = {
      arrowParens = "always";
      bracketSameLine = true;
      bracketSpacing = true;
      editorconfig = false;
      plugins = [
        "${prettier-plugin-svelte}/lib/node_modules/prettier-plugin-svelte/plugin.js"
      ];
      printWidth = 88;
      singleQuote = true;
      tabWidth = 4;
      trailingComma = "es5";
      useTabs = false;
    };
  };
}
