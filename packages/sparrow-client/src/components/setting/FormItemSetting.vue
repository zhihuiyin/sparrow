<template>
  <div>
    <el-scrollbar class="right-scrollbar">
      <el-form size="small" label-width="90px">
        <el-form-item v-if="fieldConfig._custom.required!==undefined" label="必填">
          <el-switch
            v-model="fieldConfig._custom.required"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>

        <el-form-item 
          v-if="fieldConfig._attr.placeholder!==undefined"
          label="placeholder"
        >
          <el-input v-model="fieldConfig._attr.placeholder" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>

    </el-scrollbar>
      
  </div>
</template>
<script>
export default {
  props: ['fieldConfig']
}
</script>
<style lang="scss" scoped>

</style>