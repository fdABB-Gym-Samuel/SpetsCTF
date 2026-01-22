# This Nix derivation file is inherited from the Nixpkgs repository. The
# original license regulating the usage of this file as well as containing
# the copyright notice of the original owners follows below.
#
# Copyright (c) 2003-2025 Eelco Dolstra and the Nixpkgs/NixOS contributors
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# END OF LICENSE
{
  lib,
  buildGoModule,
  fetchFromGitHub,
}:
buildGoModule rec {
  pname = "go-migrate";
  version = "4.19.1";

  src = fetchFromGitHub {
    owner = "golang-migrate";
    repo = "migrate";
    rev = "v${version}";
    sha256 = "sha256-Z8ufA2z5XeJ80Jfd6NSls/SurR8rMTO4zq88fQYGGpA=";
  };

  proxyVendor = true; # darwin/linux hash mismatch
  vendorHash = "sha256-IaTNm119GO+1DkGYHFD8A8B/rWOVy0KAiXMhKj0zC/M=";

  subPackages = [ "cmd/migrate" ];

  tags = [
    "pgx"
    "pgx5"
    "postgres"
    "shell"
    "testing"
  ];

  meta = with lib; {
    homepage = "https://github.com/golang-migrate/migrate";
    description = "Database migrations. CLI and Golang library";
    license = licenses.mit;
    mainProgram = "migrate";
  };
}
