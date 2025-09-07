import { RunResult } from "../generated/BoatGame/BoatGame"
import { User } from "../generated/schema"

export function handleBoatGameRunResult(event: RunResult): void {
  if (!event.params.success) return;
  let user = User.load(event.params.user.toHex())
  if (!user) {
    user = new User(event.params.user.toHex())
    user.boatWins = 0
    user.jointWins = 0
  }
  user.boatWins += 1
  user.save()
}
