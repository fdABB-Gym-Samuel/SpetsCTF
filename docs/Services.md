# Packaging services for SpetsCTF challenges

This page is intended to guide the aspiring CTF challenge creator in
deploying their challenge network services for the competitors. Network
services are primarily used in the `web` and `pwn` categories. Because of
the nature of CTF competitions, vulnerabilities are intentionally inserted
into these services. Thus, deploying a CTF network service improperly may
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
console application, using `stdin` and `stdout` for communication. This
is because these interfaces are available in every programming language
relevant for challenge creation. The terminal IO may be made available over
the network using daemons like `xinetd`, which is configured in the Docker
image example below.

### Web

For Web challenges, using the network is recommended, because _all_ web
frameworks (worth learning) support it.

## Docker

For deploying network services, using Docker containers is an appropriate
choice, because of its mature tooling, software availability and relative
ease of administration.

However, Docker is not the only solution. Other programs which satisfy these
criteria include:

- Nix with NixOS and Nixpkgs
  - Pros: Superb software availabilty, easy to administrate once set up and stellar reproducibility.
  - Cons: Has a steep learning curve and lackluster documentation in key areas.
- FreeBSD with Ports and Jails
  - Pros: Good isolation.
  - Cons: Imperative management often results in poor reproducibility. Software availability is not as good as Nixpkgs or Docker.

Therefore, we will accept your challenge packaged as a Docker image. Instructions on how to construct the Dockerfile follow.

## Packaging the service in a Docker image

### Pwn

For Pwn challenges, the deployment stack is as follows:

- The challenge program (binary or source code file for interpreter) is compiled.
- The flag is put in to the stack in some way
  - Using an environment variable (`ENV FLAG=...`)
  - Using a `flag.txt` text file (`COPY flag.txt /chall`) with proper permissions set (e.g. `RUN chmod 444 /chall/flag.txt`)
  - Putting the flag string into the source file (in which case no special action is needed)

#### Step 1 - Config file for `xinetd`
Create a file called `xinetd.conf` with the following contents, adjusted for your environment:
```
service chall
{
    # The internal port should be set to 4000, the outside port will be set by the SpetsCTF admin.
    port            = 4000
    socket_type     = stream
    protocol        = tcp
    wait            = no
    # This user must be a user available in the Docker image (it really should be non-root)
    user            = chall
    # If using a shebang or compiled executable, server_args can be ignored.
    server          = /usr/bin/python3
    server_args     = /chall/chall.py
    disable         = no
    # Important, since this service is not listed in /etc/services
    type            = UNLISTED
}
```

#### Step 2 - Dockerfile

```dockerfile
# Alpine does not have the xinetd package.
# We use the slim variant to save storage space.
FROM debian:12.10-slim

# Python can be omitted if your application is a compiled binary.
RUN apt update && apt install -y xinetd python3
# Put the xinetd config file in the correct location.
COPY xinetd.conf /etc
# Suggestion: create a /chall directory containing the server code and flag file.
WORKDIR /chall
COPY chall.py flag.txt .

# Privilege separation.
RUN adduser flag
RUN adduser chall
RUN chown flag:flag /chall/flag.txt
RUN chmod 444 /chall/flag.txt

# Remember to switch user and mark the port set in xinetd.conf.
USER chall
EXPOSE 4000

CMD ["/usr/sbin/xinetd", "-dontfork", "-f", "/etc/xinetd.conf"]
```
