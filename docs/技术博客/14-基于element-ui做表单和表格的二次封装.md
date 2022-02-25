---
title: 基于element-ui做表单和表格的二次封装
date: 2021-12-21
categories:
  - 技术博客
tags:
  - 组件
---

以后台管理系统为例，我们可以使用 约定配置的方式配置表单和表格组件简化 组件书写和操作

<!-- more -->

## el-form表单配置方式封装

主要通过判断表单的类型分别实现对应 element-ui中的表单组件

```vue
<template>
  <el-form
    ref="form"
    class="el-form-extend"
    :inline="inline"
    :model="formModel"
    :rules="formRules"
    :label-width="labelWidth"
    :label-position="labelPosition"
    v-bind="$attrs"
    v-on="$listeners"
    :validate-on-rule-change="false"
  >
    <el-form-item
      v-for="(item, index) in fieldList"
      :key="index"
      :prop="item.value"
      :label="item.label"
      :class="item.className"
      v-show="!item.hidden"
    >
      <!-- 支持带属性名的自定义插槽 -->
      <template v-if="item.type === 'slot'">
        <slot :name="'item-' + item.value" />
      </template>
      <!-- input -->
      <el-input
        v-if="item.type === 'input'"
        v-model="formModel[item.value]"
        :type="item.type"
        :disabled="item.disabled"
        :placeholder="getPlaceholder(item)"
        :autofocus="item.autofocus"
        class="extend-el-input"
      />
      <!-- textarea -->
      <el-input
        v-if="item.type === 'textarea'"
        v-model.trim="formModel[item.value]"
        :type="item.type"
        :disabled="item.disabled"
        :placeholder="getPlaceholder(item)"
        :autosize="item.autosize || { minRows: 2, maxRows: 10 }"
        :autofocus="item.autofocus"
        class="extend-el-input-textaread"
      />
      <!-- select -->
      <el-select
        v-if="item.type === 'select'"
        v-model="formModel[item.value]"
        :placeholder="getPlaceholder(item)"
        :disabled="item.disabled"
        :clearable="item.clearable"
        :filterable="item.filterable"
        @change="handleClick(item.event, formModel[item.value])"
      >
        <el-option
          v-for="option in item.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        >
        </el-option>
      </el-select>

      <!-- 单选框组 -->
      <el-radio-group
        v-if="item.type === 'radio-group'"
        v-model="formModel[item.value]"
        :disabled="item.disabled"
        @change="handleClick(item.event, formModel[item.value])"
      >
        <el-radio
          v-for="option in item.options"
          :key="option.value"
          :label="option.value"
        >
          {{ option.label }}
        </el-radio>
      </el-radio-group>
      <!-- date picker -->
      <el-date-picker
        v-if="item.type === 'date'"
        v-model="formModel[item.value]"
        :type="item.dateType"
        :picker-options="item.TimePickerOptions"
        :clearable="item.clearable"
        :disabled="item.disabled"
        :placeholder="getPlaceholder(item)"
        @focus="handleClick(item.event)"
      />
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "ElFormExtend",
  props: {
    refObj: { type: Object },
    inline: { type: Boolean, default: true},
    // 表单双向绑定数据
    formModel: { type: Object, default: () => ({}) },
    // 要传入的表单配置
    /**
     * type: 类型
     * label: 标题
     * value: 值
     * options: 选项
     * disabled: 是否禁用
     * hidden: 是否隐藏
     * validator: 校验规则
     */
    fieldList: { type: Array },
    rules: { type: Object, default: () => ({}) },
    // 默认width
    labelWidth: { type: String, default: "100px" },
    labelPosition: { tyep: String, default: "left" },
  },
  // 则默认生成一个基本的规则和提示消息
  computed: {
    formRules() {
      if (!this.fieldList || this.fieldList.length === 0) {
        return this.rules;
      }
      // 快速规则
      let fieldRules = this.fieldList
        .filter(
          ({ required, validator }) => required  || validator
        )
        .reduce((rules, fieldConfig) => {
          let {
            label,
            value,
            type,
            required,
            validator,
            rules: itemRules,
          } = fieldConfig;
          let trigger = "blur";
          rules[value] = [];
          if (required) {
            const requireTips =
              type === "select" ? `请选择${label}` : `请输入${label}`;
            rules[value].push({ required, message: requireTips, trigger });
          }
          if (validator) {
            rules[value].push({ validator, trigger });
          }
          if (itemRules) {
            rules[value] = rules[value].concat(itemRules);
          }
          return rules;
        }, {});
      return { ...fieldRules, ...this.rules };
    },
  },
  watch: {
    formModel: {
      handler() {
        this.$emit("update:refObj", this.$refs.form);
      },
      deep: true,
    },
  },
  mounted() {
    this.$emit("update:refObj", this.$refs.form);
  },
  methods: {
    getPlaceholder({ type, label, placeholder }) {
      if (placeholder) return placeholder;
      if (["input", "textarea"].includes(type)) {
        return "请输入" + label;
      }
      if (["select", "time", "date"].includes(type)) {
        return "请选择" + label;
      }
      return placeholder;
    },
    // 返回上级当前 根据 指定 event 属性触发
    handleClick(event, data) {
      event && this.$emit("handleClick", { event, data });
    },
  },
};
</script>
```

使用封装的组件进行配置

```vue
<template>
  <div class="hello">
    <ElFormExtend
      :formModel="form"
      :fieldList="[
        { label: '姓名', value: 'name', type: 'input' },
        { label: '年龄', value: 'age', type: 'input' },
        {
          label: '家庭住址',
          value: 'address',
          type: 'select',
          options: ['地址1', '地址2'].map((str) => ({
            label: str,
            value: str,
          })),
        },
        {
          label: '性别',
          value: 'sex',
          type: 'radio-group',
          options: ['男', '女'].map((str) => ({ label: str, value: str })),
        },
      ]"
    />
  </div>
</template>

<script>
import ElFormExtend from './ElFormExtend.vue'
export default {
  name: "HelloWorld",
  components: {
    ElFormExtend
  },
  data(){
    return {
      form: {
        name: '',
        age: '',
        address: '',
        sex: '男',
      }
    }
  }
};
</script>
```

## el-table表格配置方式

