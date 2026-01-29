<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  NAlert,
  NButton,
  NCard,
  NCheckbox,
  NDivider,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSpin,
  NSwitch,
  NSpace,
} from 'naive-ui';

type Task = PB_DB.Tasks;
type TaskItem = PB_DB.TaskItems;
type CustomParams = PB_DB.CustomParams;

const props = defineProps<{ id: string }>();

const loading = ref(false);
const saving = ref(false);
const errorMessage = ref<string | null>(null);

const countriesInput = ref('');
const form = ref<Task>({
  app_id: props.id,
  app_name: '',
  icon_url: '',
  disabled: false,
  countries: '',
  proxy: '',
  send_page_view: false,
  use_page_view: false,
  page_click: '',
  page_click_rate: 0,
  prefix: '',
  click_duration: 0,
  click_ratio: 0,
  clicks: [],
});

const items = computed({
  get: () => form.value.clicks ?? [],
  set: (value: TaskItem[]) => {
    form.value.clicks = value;
  },
});

const defaultCustomParams = (): CustomParams => ({
  deep_link_sub1: '',
  deep_link_sub2: '',
  deep_link_sub3: '',
  deep_link_sub4: '',
  deep_link_sub10: '',
});

const createItem = (): TaskItem => ({
  id: crypto.randomUUID(),
  disabled: false,
  task_id: form.value.app_id,
  deep_link_value: '',
  custom_params: defaultCustomParams(),
  weight: 0,
  page_url: '',
  impact_url: '',
  redirect_until: '',
  item_name: '',
  use_impact_return: false,
  use_impact_click: false,
});

const normalizeCountries = (value: string): string[] | string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const parts = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : parts[0];
};

const setCountriesInput = (value: Task['countries']) => {
  if (Array.isArray(value)) {
    countriesInput.value = value.join(', ');
  } else {
    countriesInput.value = value ?? '';
  }
};

const fetchTask = async () => {
  if (!props.id) {
    setCountriesInput(form.value.countries);
    return;
  }

  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch(`/api/tasks/${props.id}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`请求失败 (${response.status})`);
    }

    const task = (await response.json()) as Task;
    form.value = {
      ...form.value,
      ...task,
      clicks: task.clicks ?? [],
    };
    setCountriesInput(form.value.countries);
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    errorMessage.value = `加载任务失败：${message}`;
  } finally {
    loading.value = false;
  }
};

const addItem = () => {
  items.value = [...items.value, createItem()];
};

const removeItem = (index: number) => {
  items.value = items.value.filter((_, idx) => idx !== index);
};

const saveTask = async () => {
  saving.value = true;
  errorMessage.value = null;
  try {
    const payload: Task = {
      ...form.value,
      app_id: form.value.app_id.trim(),
      app_name: form.value.app_name.trim(),
      icon_url: form.value.icon_url.trim(),
      countries: normalizeCountries(countriesInput.value),
      clicks: items.value.map((item) => ({
        ...item,
        task_id: form.value.app_id.trim(),
        custom_params: item.custom_params || defaultCustomParams(),
      })),
    };

    const response = await fetch('/api/tasks', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`保存失败 (${response.status})`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    errorMessage.value = `保存任务失败：${message}`;
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.id,
  () => {
    fetchTask();
  }
);

onMounted(fetchTask);
</script>

<template>
  <n-card class="task-card" content-style="padding: 20px;">
    <div class="task-header">
      <div class="task-title">任务详情</div>
      <n-button type="primary" :loading="saving" @click="saveTask">保存</n-button>
    </div>

    <n-space vertical size="large">
      <n-alert v-if="errorMessage" type="error" show-icon>
        {{ errorMessage }}
      </n-alert>

      <n-spin :show="loading">
        <n-form label-width="120px" label-placement="left">
          <n-form-item label="任务 ID">
            <n-input v-model:value="form.app_id" placeholder="app_id" />
          </n-form-item>

          <n-form-item label="任务名称">
            <n-input v-model:value="form.app_name" placeholder="app_name" />
          </n-form-item>

          <n-form-item label="图标地址">
            <n-input v-model:value="form.icon_url" placeholder="icon_url" />
          </n-form-item>

          <n-form-item label="禁用">
            <n-switch v-model:value="form.disabled" />
          </n-form-item>

          <n-form-item label="国家列表">
            <n-input v-model:value="countriesInput" placeholder="US, CA, JP" />
          </n-form-item>

          <n-form-item label="代理">
            <n-input v-model:value="form.proxy" placeholder="proxy" />
          </n-form-item>

          <n-divider>页面统计</n-divider>

          <n-form-item label="发送 PV">
            <n-checkbox v-model:checked="form.send_page_view">send_page_view</n-checkbox>
          </n-form-item>

          <n-form-item label="使用 PV">
            <n-checkbox v-model:checked="form.use_page_view">use_page_view</n-checkbox>
          </n-form-item>

          <n-form-item label="点击页面">
            <n-input v-model:value="form.page_click" placeholder="page_click" />
          </n-form-item>

          <n-form-item label="点击率">
            <n-input-number v-model:value="form.page_click_rate" :min="0" :step="0.01" />
          </n-form-item>

          <n-form-item label="前缀">
            <n-input v-model:value="form.prefix" placeholder="prefix" />
          </n-form-item>

          <n-divider>点击参数</n-divider>

          <n-form-item label="点击时长">
            <n-input-number v-model:value="form.click_duration" :min="0" />
          </n-form-item>

          <n-form-item label="点击占比">
            <n-input-number v-model:value="form.click_ratio" :min="0" :step="0.01" />
          </n-form-item>

          <n-divider>任务条目</n-divider>

          <n-space vertical size="large">
            <n-button secondary @click="addItem">添加条目</n-button>

            <n-card
              v-for="(item, index) in items"
              :key="item.id"
              class="item-card"
              content-style="padding: 16px;"
            >
              <div class="item-header">
                <div class="item-title">条目 {{ index + 1 }}</div>
                <n-button tertiary type="error" @click="removeItem(index)">删除</n-button>
              </div>

              <n-form-item label="条目名称">
                <n-input v-model:value="item.item_name" placeholder="item_name" />
              </n-form-item>

              <n-form-item label="禁用">
                <n-switch v-model:value="item.disabled" />
              </n-form-item>

              <n-form-item label="深链值">
                <n-input v-model:value="item.deep_link_value" placeholder="deep_link_value" />
              </n-form-item>

              <n-form-item label="权重">
                <n-input-number v-model:value="item.weight" :min="0" />
              </n-form-item>

              <n-form-item label="页面 URL">
                <n-input v-model:value="item.page_url" placeholder="page_url" />
              </n-form-item>

              <n-form-item label="Impact URL">
                <n-input v-model:value="item.impact_url" placeholder="impact_url" />
              </n-form-item>

              <n-form-item label="重定向截止">
                <n-input v-model:value="item.redirect_until" placeholder="redirect_until" />
              </n-form-item>

              <n-form-item label="使用回跳">
                <n-checkbox v-model:checked="item.use_impact_return">use_impact_return</n-checkbox>
              </n-form-item>

              <n-form-item label="使用点击">
                <n-checkbox v-model:checked="item.use_impact_click">use_impact_click</n-checkbox>
              </n-form-item>

              <n-divider>自定义参数</n-divider>

              <n-form-item label="sub1">
                <n-input
                  v-model:value="(item.custom_params as CustomParams).deep_link_sub1"
                  placeholder="deep_link_sub1"
                />
              </n-form-item>

              <n-form-item label="sub2">
                <n-input
                  v-model:value="(item.custom_params as CustomParams).deep_link_sub2"
                  placeholder="deep_link_sub2"
                />
              </n-form-item>

              <n-form-item label="sub3">
                <n-input
                  v-model:value="(item.custom_params as CustomParams).deep_link_sub3"
                  placeholder="deep_link_sub3"
                />
              </n-form-item>

              <n-form-item label="sub4">
                <n-input
                  v-model:value="(item.custom_params as CustomParams).deep_link_sub4"
                  placeholder="deep_link_sub4"
                />
              </n-form-item>

              <n-form-item label="sub10">
                <n-input
                  v-model:value="(item.custom_params as CustomParams).deep_link_sub10"
                  placeholder="deep_link_sub10"
                />
              </n-form-item>
            </n-card>
          </n-space>
        </n-form>
      </n-spin>
    </n-space>
  </n-card>
</template>

<style scoped>
.task-card {
  max-width: 960px;
  margin: 0 auto;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.task-title {
  font-size: 18px;
  font-weight: 600;
}

.item-card + .item-card {
  margin-top: 16px;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
}
</style>
