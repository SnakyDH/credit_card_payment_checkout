import { Presigned } from '../model/presigned.model';

export interface IPresignedRepository {
  getPresigneds(): Promise<Presigned[]>;
}
