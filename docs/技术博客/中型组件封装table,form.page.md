---
title: 使用Element-UI封装重型组件el-form-table-pagination
date: 2021-08-01
categories:
  - 技术博客
tags:
  - 组件二次封装
---

## 搜索表单

根据formOptions渲染 顶部表单组件(抽离表单)

```vue
<template>
  <div class="search-form">
    <el-form
      ref="form"
      :model="modelForm"
      :inline="inline"
      :label-width="labelWidth"
      :rules="rules"
      :size="size"
      @submit.native.prevent="searchHandler"
    >
      <el-form-item
        v-for="(formItem, index) in forms"
        :key="index"
        :prop="formItem.prop"
        :label="formItem.label"
        :label-width="
          typeof formItem.labelWidth === 'number'
            ? formItem.labelWidth + 'px'
            : formItem.labelWidth
        "
      >
        <!-- 判断 type -->
        <el-input
          v-if="
            formItem.itemType === 'input' || formItem.itemType === undefined
          "
          :size="formItem.size ? formItem.size : size"
          v-model="modelForm[formItem.prop]"
        ></el-input>
        <el-select
          v-else-if="formItem.itemType === 'select'"
          v-model="modelForm[formItem.prop]"
          :multiple="formItem.multiple"
        >
          <el-option
            v-for="item in formItem.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-date-picker
          v-if="formItem.itemType === 'datetime'"
          v-model="modelForm[formItem.prop]"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          :picker-options="pickerOptions"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item :size="size">
        <el-button type="primary" @click="searchHandler">搜索</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import pickerOptions from "./picker-options";
export default {
  name: "search-form",
  props: {
    inline: {
      type: Boolean,
      default: false,
    },
    labelWidth: [String, Number],
    itemWidth: [String, Number],
    submitHandler: Function,
    size: String,
    rules: {
      type: Array,
    },
    forms: {
      type: Array,
      required: true,
    },
  },
  data() {
    const { forms } = this;
    const searchForm = {};
    forms.forEach((form) => {
      searchForm[form.prop] = form.defaultValue || "";
    });
    return {
      modelForm: searchForm,
      pickerOptions: pickerOptions,
    };
  },
  methods: {
    searchHandler() {
      this.$emit("submit-form", this.modelForm);
    },
    resetForm() {
      this.$refs["form"].resetFields();
      this.$emit("reset-form", this.modelForm);
    },
  },
};
</script>

<style>
</style>
```

## 表格与分页

将复杂表格格式化抽离 slot供外部调用

```vue
<template>
  <div>
    <search-form
      v-if="formOptions"
      ref="searchForm"
      :forms="formOptions.forms"
      :size="size"
      :inline="formOptions.inline"
      :label-width="formOptions.labelWidth"
      @submit="searchHandler"
      @reset="searchHandler"
    ></search-form>
    <slot name="form" :loading="loading"></slot>
    <slot />
    <el-table
      v-loading.lock="loading"
      ref="table"
      :data="tableData"
      :border="border"
      :size="size"
      :stripe="stripe"
      :height="height"
      :max-height="maxHeight"
      :show-header="showHeader"
      :row-style="rowStyle"
    >
      <slot name="prepend" />
      <template v-for="(column, columnIndex) in columns">
        <el-table-column
          align="center"
          :key="columnIndex"
          :column-key="column.columnKey"
          :prop="column.prop"
          :label="column.label"
          :width="column.minWidth ? '-' : column.width || 140"
          :minWidth="column.minWidth || column.width || 140"
          :fixed="column.fixed"
          :render-header="column.renderHeader"
          :resizable="column.resizable"
          :formatter="column.formatter"
          :class-name="column.className"
        >
          <template slot-scope="scope">
            <!-- 指定 slot名称 -->
            <span v-if="column.slotName">
              <slot
                :name="column.slotName"
                :row="scope.row"
                :$index="scope.$index"
              />
            </span>
            <!-- 指定 render函数  -->
            <span v-else-if="column.render">
              {{ column.render(scope.row) }}
            </span>
            <!-- 组件 -->
            <span v-else-if="column.component">
              <component :is="column.component" :row="scope.row"></component>
            </span>
            <span v-else>
              {{ scope.row[column.prop] }}
            </span>
          </template>
        </el-table-column>
      </template>
      <slot name="append" />
    </el-table>
    <div v-if="showPagination" style="margin-top: 10px">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageIndex"
        :page-sizes="pageSizes"
        :page-size="pagination.pageSize"
        :layout="paginationLayout"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import SearchForm from "./search-form.vue";
export default {
  name: "el-search-table-pagination",
  components: {
    SearchForm,
  },
  props: {
    size: {
      type: String,
      default: "medium",
    },
    height: [String, Number],
    maxHeight: [String, Number],
    size: String,
    stripe: Boolean,
    border: {
      type: Boolean,
      default: true,
    },
    formOptions: {
      type: Object,
    },
    columns: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      default: "remote",
      validator(value) {
        const types = ["remote", "local"];
        const validType = types.indexOf(value) !== -1;
        if (!validType) {
          throw new Error(
            `Invalid type of '${value}', please set one type of 'remote' or 'local'.`
          );
        }
        return validType;
      },
    },
    localData: {
      type: Array,
    },
    showPagination: {
      type: Boolean,
      default: true,
    },
    pageSizes: {
      type: Array,
      default: () => {
        return [20, 50, 100];
      },
    },
    paginationLayout: {
      type: String,
      default: "total, prev, pager, next, jumper, sizes",
    },
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    listField: {
      type: String,
      default: "data.list",
    },
    totalField: {
      type: String,
      default: "data.total",
    },
    fetch: {
      type: Function,
    },

    currentRowKey: [String, Number],
    rowClassName: [String, Function],
    rowStyle: [String, Function],
    showHeader: {
      type: Boolean,
      default: true,
    },
    autoLoad: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    const getDefaultPageSize = () => {
      const { pageSizes } = this;
      if (pageSizes.length > 0) {
        return pageSizes[0];
      }
      return 20;
    };
    return {
      pagination: {
        pageIndex: 1,
        pageSize: getDefaultPageSize(),
      },
      total: 0,
      loading: false,
      tableData: [],
      cachedLocalData: [],
    };
  },
  watch: {
    localData(value) {
      this.loadLocalData(value);
    },
  },
  mounted() {
    // load local table
    const { autoLoad, formOptions, type, params, localData } = this;
    if (type === "remote" && autoLoad) {
      if (formOptions) {
        // 处理搜索表单
      }
    } else if (type === "local") {
      this.loadLocalData(localData);
    }
  },
  methods: {
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.dataChangeHandler();
    },
    handleCurrentChange(pageIndex) {
      this.pagination.pageIndex = pageIndex;
      this.dataChangeHandler();
    },
    dataChangeHandler() {
      const { type } = this;
      if (type === "local") {
        // 本地数据切换
        this.dataFilter();
      } else if (type === "remote") {
        // fetch
        this.fetchHandler();
      }
    },
    fetchHandler(formParams = {}) {
      // page search
    },
    dataFilter() {
      const { pageIndex, pageSize } = this.pagination;
      const { cachedLocalData } = this;
      return cachedLocalData.filter((v, i) => {
        return i >= (pageIndex - 1) * pageSize && i < pageIndex * pageSize;
      });
    },
    loadLocalData(data) {
      const { autoLoad } = this;
      if (!data) {
        throw new Error(`type为local时, data必须存在.`);
      }
      const cacheData = JSON.parse(JSON.stringify(data));
      this.cachedLocalData = cacheData;
      if (autoLoad) {
        this.tableData = this.dataFilter();
        this.total = cacheData.length;
      }
    },
    searchHandler(searchParams = {}) {},
  },
};
</script>

<style>
</style>
```

## 使用

```vue
<template>
  <div id="app">
    <!-- <div class="message-tesst">
      <h2>消息示例demo</h2>
      <button @click="kiko">打开kiko</button>
    </div> -->
    <ElSearchTablePagination
      :form-options="formOptions"
      :columns="columns"
      type="local"
      :local-data="tableData"
    >
      <template #opator="scope">
        <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">
          编辑
        </el-button>
        <el-button
          size="mini"
          type="danger"
          @click="handleDelete(scope.$index, scope.row)"
        >
          删除
        </el-button>
      </template>
    </ElSearchTablePagination>
  </div>
</template>
<script>
export default {
    data() {
    return {
      tableData: [
        {
          sex: 0,
          name: "王小虎",
          mobile: "12345345312",
        },
        {
          sex: 1,
          name: "王小虎",
          mobile: "12345345312",
        },
        {
          sex: 1,
          name: "王小虎",
          mobile: "12345345312",
        },
        {
          sex: 0,
          name: "王小虎",
          mobile: "12345345312",
        },
      ],
      formOptions: {
        inline: true,
        submitBtnText: "Search",
        labelWidth: "80px",
        forms: [
          { prop: "name", label: "Name", labelWidth: "100px" },
          { prop: "mobile", label: "Mobile" },
          {
            prop: "sex",
            label: "Sex",
            itemType: "select",
            options: [
              { value: "", label: "All" },
              { value: 0, label: "Male" },
              { value: 1, label: "Female" },
            ],
          },
          {
            prop: "datetime",
            label: "time",
            itemType: "datetime",
          },
        ],
      },
      columns: [
        { prop: "name", label: "Name", width: 140 },
        { prop: "mobile", label: "Mobile", minWidth: 180 },
        {
          prop: "sex",
          label: "Sex",
          minWidth: 180,
          render: (row) => {
            const { sex } = row;
            return sex === 0 ? "Male" : sex === 1 ? "Female" : "Unknow";
          },
        },
        {
          prop: "opator",
          label: "操作",
          minWidth: 160,
          slotName: "opator",
        },
      ],
    };
  },
}
</script>
```