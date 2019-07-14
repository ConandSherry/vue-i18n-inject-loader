# vue-i18n-generator

Auto insert \$t function in vue file which vue-i18n needed

Modify the `components` variable in `index.js` file, so u can choose the vue file you need generating.

Also this program can't accurately analysis the scope in some cases,

it will convert code

```
let self = this;
function fun(){
    self.var = '中文'
}
ele.addEventListener('click',fun)
```

to

```
let self = this;
function fun(){
    self.var = this.$t('中文')
}
ele.addEventListener('click',fun)
```

when running, u will get `can't get $t function` error, so i choose using global variable `$t`. U may create the global
variable like this in your program.

```
new Vue({
    el: '#app',
    i18n,
    created() {
        window.$t = this.$t.bind(this);
    },
    render: h => h(App)
});
```
