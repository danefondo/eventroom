# Document to provide a troubleshooting checklist
The purpose of a troubleshooting checklist is to give an effective framework to troubleshoot efficiently and methodically, without missing or forgetting common problem checks. It's for reference and confirmation, a means to quickly determine whether a particular problem stems from any of the known and common issues, and if not, then one can begin a deeper dive and examination into the details. This is akin to a checklist an airplane or space shuttle might go through pre take-off and landing. 

It is also to not be reliant on active memory and brain recall, for they might not always be completely reliable.

## Post-skimming through the troubleshoot and not finding a solution checklist:
- [ ] Use debugs and go through the full cycle process to identify the problem.

## HTTP request issues
### GET request not working
- [ ] Check that code is executed in the right order (e.g., an asterisk (*) route takes priority if before other routes)