import { JointRun } from "../generated/JointBoatGame/JointBoatGame"
import { User } from "../generated/schema"

export function handleJointBoatGameRun(event: JointRun): void {
  if (!event.params.success) return;
  let user = User.load(event.params.user.toHex())
  if (!user) {
    user = new User(event.params.user.toHex())
    user.boatWins = 0
    user.jointWins = 0
  }
  user.jointWins += 1
  user.save()
}
