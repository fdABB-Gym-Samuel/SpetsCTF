# SpetsCTF

## Description

SpetsCTF is a ctf and wargames platform, meant to organize the annual SpetsCTF, as well as provide students a simple way to practise on previous years' challenges. Inspired by SSM (SäkerhetsSM).

## TODO

Things still needed:

- [x] Api for scoreboard
- [x] Api for Challenges
- [x] Update challengeCard and challengeDialog to work with api
- [x] Check if user has already submitted valid flag on challenge, to avoid cluttering up database more than needed
- [x] Fix resources in challenge upload
- [x] Link resources to challenges in database
- [x] Check if challenge belongs to a CTF that has ended before showing in /challenges
- [x] Make functionality to add CTFs
- [ ] Allow non-admin users to propose challenges before being validate by an admin
- [x] Validate filenames and challenge_ids before adding them to resources (prevent pathtraversal)
