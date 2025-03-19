{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  name = "pladdra";
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
}
