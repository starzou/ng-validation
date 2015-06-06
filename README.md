# ng-validation
A high-performance and high-availability form validation component based on AngularJS.


## Install

You can install this package either with `npm` or with `bower`.

Install with npm

```
npm install ng-validation --save
```

or with bower

```
bower install ng-validation --save
```


## Quick start

+ Install ng-validation with [Bower](https://github.com/bower/bower).

>
```bash
$ bower install ng-validation --save
```

+ Include the required libraries in your `index.html`:

>
``` html
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/ng-validation/angular-validation.min.js"></script>
```

+ Inject the `ngValidation` module into your app:

>
``` js
angular.module('myApp', ['ngValidation']);
```

+ Writing your First Code

>
``` html
<form name="regForm" validation-form>
    <div class="form-group">
        <label for="userName">用户名</label>
        <input ng-model="user.userName" validation-field required minlength="3" type="text" class="form-control" id="userName" placeholder="Enter UserName">
    </div>
    <div class="form-group">
        <label for="userEmail">邮箱</label>
        <input ng-model="user.email" validation-field required message="{email:'请输入正确的邮箱'}" type="email" class="form-control" id="userEmail" placeholder="Enter Email">
    </div>
    <div class="form-group">
        <label for="userPassword">密码</label>
        <input ng-model="user.password" validation-field required minlength="6" type="password" class="form-control" id="userPassword" placeholder="Enter Password">
    </div>
    <div class="form-group">
        <label for="website">网站</label>
        <input ng-model="user.website" validation-field required type="url" class="form-control" id="website" placeholder="Enter Website">
    </div>
    <button type="submit" class="btn btn-default">注册</button>
</form>
```

+ Example

>
[![image](https://github.com/starzou/ng-validation/blob/gh-pages/docs/images/ng-validation.png)](http://starzou.github.io/ng-validation/docs/index.html)


## Documentation and examples

+ Check the [Documentation](http://starzou.github.io/ng-validation/docs/index.html) and [Change Log](https://github.com/starzou/ng-validation/releases).


## Communication

- If you **need help**, use [Stack Overflow](http://stackoverflow.com/questions/tagged/ng-validation). (Tag 'ng-validation')
- If you'd like to **ask a general question**, use [Stack Overflow](http://stackoverflow.com/questions/tagged/ng-validation).
- If you **found a bug**, open an issue.
- If you **have a feature request**, open an issue.
- If you **want to contribute**, submit a pull request.


## Contributing

Please submit all pull requests the against master branch. If your pull request contains JavaScript patches or features, you should include relevant unit tests. 
Please check the [Contributing Guidelines](https://github.com/starzou/ng-validation) for more details.
Thanks!


## License
Copyright (c) 2015 StarZou. https://github.com/starzou

Licensed under the MIT license.