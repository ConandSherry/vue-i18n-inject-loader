<template>
    <div
        en-attr="en-attr"
        cn-attr="中文"
        :bingattr="'中文' | filtera | filterb"
        single
        @scroll="throttle(down)()"
        :class="['modal-default-button', { 'disabled-button': disabledOk, 'only-one': msg.hasOwnProperty('中文') }]"
        v-drag="{
            locations: '中文',
            hammertime: hammertime
        }"
    >
        english
        {{ (vara + varb + '中文') | filtera | filterb }}
        中文{{ ('english' + '中文') | filtera | filterb }}中文
        <div>&nbsp;</div>
        <div>&nbsp;中文&nbsp;&nbsp;&nbsp;中文</div>
        <svg class="icon normal" aria-hidden="true">
            <use xlink:href="中文"></use>
        </svg>
    </div>
</template>

<script>
export default {
    data() {
        return {
            title: '中文',
            list: ['中文', '中文', '中文']
        };
    },
    methods: {
        onClick() {
            this.btnText = `中文`;
            this.title = `中文${this.flag ? `中文${this.flag ? '中文' : '中文'}` : '中文'}中文`;
            this.flag ? (this.flag ? '中文' : '中文') : '中文';
            $message('中文');
            const val = '中文';
            this.$message($t(`中文`));
            $t(`中文`);
        }
    }
};
</script>

<style lang="less">
.dynamic-strings {
    color: pink;
}
</style>
