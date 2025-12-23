<template>
  <!-- Cards Grid -->
  <section class="cards-section">
    <div class="container">
      <el-row v-if="prompts.length > 0" :gutter="16">
        <el-col
          v-for="item in prompts"
          :key="item.id"
          :xs="12"
          :sm="8"
          :md="8"
          :lg="8"
        >
          <el-card
            shadow="hover"
            style="margin-bottom: 16px"
            @click="$emit('select', item)"
          >
            <el-image
              :src="item.image"
              :alt="item.title"
              fit="contain"
              loading="lazy"
              style="width: 100%; height: 220px; background: #f8f8f8"
            />
            <div style="margin-top: 12px">
              <div class="card-title">{{ item.title }}</div>
              <div style="margin-top: 8px">
                <el-tag
                  :type="item.needsImage ? 'success' : 'info'"
                  effect="light"
                >
                  {{ item.categoryLabel }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-else description="没有找到匹配的提示词" />
    </div>
  </section>
</template>

<script>
export default {
  name: "PromptGrid",
  props: {
    prompts: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["select"],
};
</script>
