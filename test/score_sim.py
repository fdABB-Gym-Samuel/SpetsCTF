initial = 500
# The minimum amount of points a challenge can be
minimum = 100
# How many solves before the challenge reaches its minimum value
decay = 15

# DO NOT EDIT BELOW THIS LINE
import math
solves = 0
value = (((minimum - initial)/(decay**2)) * (solves**2)) + initial
while value > minimum:
  # The value of the challenge after i solves
  value = (((minimum - initial)/(decay**2)) * (solves**2)) + initial +1
  value = math.ceil(value)
  print(solves, "solves", value, "points")
  solves += 1