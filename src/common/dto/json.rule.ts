import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint()
export class JSONValidate implements ValidatorConstraintInterface {
  validate(value: string): boolean | Promise<boolean> {
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  }
}
