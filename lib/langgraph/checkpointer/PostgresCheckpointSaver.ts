import { RunnableConfig } from "@langchain/core/runnables";
import {
  BaseCheckpointSaver,
  Checkpoint,
  CheckpointTuple,
  CheckpointMetadata,
  type CheckpointListOptions,
} from "@langchain/langgraph-checkpoint";

import { getDataSource } from "@/lib/database/connection";
import { TicketWorkflowState } from "@/lib/database/entities/TicketWorkflowState";

type ChannelVersions = Record<string, number | string>;

export class PostgresCheckpointSaver extends BaseCheckpointSaver {
  /**
   * Получить checkpoint tuple по config
   */
  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const threadId = config.configurable?.thread_id;
    if (!threadId) {
      console.warn("[PostgresCheckpointer] No thread_id in config");
      return undefined;
    }

    const connection = await getDataSource();
    const repo = connection.getRepository(TicketWorkflowState);

    const record = await repo.findOne({ where: { thread_id: threadId } });

    if (!record) {
      console.log(`[PostgresCheckpointer] No checkpoint found for ${threadId}`);
      return undefined;
    }

    console.log(`[PostgresCheckpointer] Loaded checkpoint for ${threadId}`);

    return {
      config,
      checkpoint: record.checkpoint_data as Checkpoint,
      metadata: record.metadata as CheckpointMetadata,
    };
  }

  /**
   * Список checkpoints (для list операций)
   */
  async *list(
    config: RunnableConfig,
    _options?: CheckpointListOptions,
  ): AsyncGenerator<CheckpointTuple> {
    const threadId = config.configurable?.thread_id;
    if (!threadId) return;

    const connection = await getDataSource();
    const repo = connection.getRepository(TicketWorkflowState);

    const record = await repo.findOne({ where: { thread_id: threadId } });

    if (record) {
      yield {
        config,
        checkpoint: record.checkpoint_data as Checkpoint,
        metadata: record.metadata as CheckpointMetadata,
      };
    }
  }

  /**
   * Сохранить checkpoint
   */
  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
    _newVersions: ChannelVersions,
  ): Promise<RunnableConfig> {
    const threadId = config.configurable?.thread_id;
    if (!threadId) {
      throw new Error(
        "Failed to put checkpoint. The passed RunnableConfig is missing a required 'thread_id' field in its 'configurable' property.",
      );
    }

    console.log(`[PostgresCheckpointer] Saving checkpoint for ${threadId}`);

    const connection = await getDataSource();
    const repo = connection.getRepository(TicketWorkflowState);

    // Upsert (INSERT or UPDATE)
    await repo.save({
      thread_id: threadId,
      checkpoint_id: checkpoint.id,
      checkpoint_data: checkpoint,
      metadata: metadata || {},
    });

    console.log(`✅ [PostgresCheckpointer] Checkpoint saved for ${threadId}`);

    return config;
  }

  /**
   * Сохранить промежуточные записи (writes)
   * Для нашего простого случая - НЕ нужно
   */
  async putWrites(
    _config: RunnableConfig,
    _writes: unknown[],
    _taskId: string,
  ): Promise<void> {
    // Упрощенная версия - игнорируем writes
    // Они нужны только для сложных multi-step workflows
    console.log(
      `[PostgresCheckpointer] putWrites called (ignored for simple HITL)`,
    );
  }

  /**
   * Удалить все checkpoints для thread
   */
  async deleteThread(threadId: string): Promise<void> {
    console.log(`[PostgresCheckpointer] Deleting thread ${threadId}`);

    const connection = await getDataSource();
    const repo = connection.getRepository(TicketWorkflowState);

    await repo.delete({ thread_id: threadId });

    console.log(`✅ [PostgresCheckpointer] Thread ${threadId} deleted`);
  }
}
