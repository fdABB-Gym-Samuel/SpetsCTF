# Packaging services for SpetsCTF challenges
This page is intended to guide the aspiring CTF challenge creator in
deploying their challenge network services for the competitors. Network
services are primarily used in the `web` and `pwn` categories. Because of
the nature of CTF competitions, vulnerabilities are intentionally inserted
into these services.  Thus, deploying a CTF network service improperly may
leave the hosting server vulnerable, which is not usually intended. Leaving
the deployment without sufficient protection can also allow bad actors to
alter and crash challenges. Therefore, this guide will make heavy use of:

- privilege separation
- process isolation (with cgroups)
- error handling

which are always important when developing systems.

## Programming the service for ease of deployment

### Pwn
For Pwn challenges, we recommend implementing the challenge service as a
console application, using `stdin` and `stdout` for communication. This is
because these interfaces are available in every programming language relevant
for challenge creation.

### Web
For Web challenges, using the network is recommended, because _all_ web
frameworks (worth learning) support it. 

## Docker
For deploying network services, using Docker containers is an appropriate
choice, because of its mature tooling, software availability and relative
ease of administration.

However, Docker is not the only solution. Other programs which satisfy these criteria include:

- Nix with NixOS and Nixpkgs
  - Pros: Superb software availabilty, easy to administrate once set up and good reproducibility.
  - Cons: Has a steep learning curve and lackluster documentation in key areas.
- FreeBSD with Ports and Jails
  - Pros: Good isolation.
  - Cons: Imperative management often results in poor reproducibility. Software availability is not as good as Nixpkgs or Docker.
