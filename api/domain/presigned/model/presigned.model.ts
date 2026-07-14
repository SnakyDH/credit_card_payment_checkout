import { PresignedType } from './presigned.type';

export class Presigned {
  constructor(
    public readonly url: string,
    public readonly type: PresignedType,
    public readonly token: string,
  ) {}
}
