import { SendBatchMessageDto, SendBatchMessageResponse, SendMessageDto, SendMessageResponse } from "../types/index.js";

export interface IProvider {
  send(data: SendMessageDto): Promise<SendMessageResponse>;
  sendBatch(data: SendBatchMessageDto): Promise<SendBatchMessageResponse>;
}