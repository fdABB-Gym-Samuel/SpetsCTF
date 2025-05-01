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
- [x] Allow non-admin users to propose challenges before being validate by an admin
- [x] Validate filenames and challenge_ids before adding them to resources (prevent pathtraversal)
- [x] Make leaderboards wrap on smaller screens (fixed with new design)
- [x] Let admins/orgs/author edit challenges
- [x] Let admins/orgs approve challenges
- [ ] Let admins/orgs add new orgs to ctf
- [ ] Make code DRYer
- [ ] Write API endpoints for people who might want to create separate clients, even if nobody will it's nice to have.
- [x] CTF countdown doesnt work correctly, seemingly when days remaining (hannes fixed with new design) is greater than 10 (tested with something in the 300s)
- [ ] Edit-challenge shows an error page on success
- [ ] Make leaderboard for ctf page
- [ ] Make a podium for top 3 of a ctf?
