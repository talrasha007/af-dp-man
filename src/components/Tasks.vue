<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  NAlert,
  NAvatar,
  NButton,
  NCard,
  NEmpty,
  NList,
  NListItem,
  NSpace,
  NSpin,
  NThing,
} from 'naive-ui';

type Task = PB_DB.Tasks;

type TaskResponse =
  | Task[]
  | {
      data?: Task[];
      tasks?: Task[];
      items?: Task[];
    };

const tasks = ref<Task[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const hasTasks = computed(() => tasks.value.length > 0);

const normalizeTasks = (payload: TaskResponse | null): Task[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.tasks)) return payload.tasks;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

const fetchTasks = async () => {
  loading.value = true;
  errorMessage.value = null;

  try {
    const response = await fetch('/api/tasks', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`请求失败 (${response.status})`);
    }

    const payload = (await response.json()) as TaskResponse;
    tasks.value = normalizeTasks(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    errorMessage.value = `加载任务失败：${message}`;
    tasks.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTasks);
</script>

<template>
  <n-card class="tasks-card" content-style="padding: 20px;">
    <div class="tasks-header">
      <div class="tasks-title">任务列表</div>
      <n-space align="center">
        <n-button :loading="loading" secondary @click="fetchTasks">刷新</n-button>
        <n-button type="primary" tag="a" href="/tasks/new">添加任务</n-button>
      </n-space>
    </div>

    <n-space vertical size="large">
      <n-alert v-if="errorMessage" type="error" show-icon>
        {{ errorMessage }}
      </n-alert>

      <n-spin :show="loading">
        <n-empty v-if="!loading && !hasTasks" description="暂无任务" />

        <n-list v-else>
          <n-list-item v-for="task in tasks" :key="task.app_id">
            <n-thing>
              <template #avatar>
                <n-avatar :src="task.icon_url" size="medium">
                  {{ (task.app_name || '?').slice(0, 1) }}
                </n-avatar>
              </template>
              <template #header>
                {{ task.app_name || '未命名任务' }}
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </n-spin>
    </n-space>
  </n-card>
</template>

<style scoped>
.tasks-card {
  max-width: 960px;
  margin: 0 auto;
}

.tasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.tasks-title {
  font-size: 18px;
  font-weight: 600;
}
</style>
