---
title: Python中的list和tuple
date: 2018-01-04T22:52:55.000Z
categories:
  - Python
tags:
  - Python语法
---

## list

Python内置的一种数据类型是列表：list。list是Python的一种叫法，和其他语言中的数组一样，是一种有序的数据集合，可以随时向其中添加和删除元素。

<!-- more -->

 一个基本的表示姓名的list：

```python
names = ['Allen', 'Youngor', 'Jack']
```

可以用`len()`函数获得list元素的个数：

```python
len(names) # 3
```

使用索引来访问list中每一个位置的元素，索引从0开始，如果从最后一个元素开始获取元素，可以用负数表示：

```python
names[0] # 'Allen'
names[1] # 'Youngor'
names[-1] # 'Jack'
names[-2] # 'Youngor'
```

当索引超出了范围时，Python会报一个`IndexError`错误，所以，要确保索引不要越界。

如果要删除列表中的一个元素，可以使用 `del` 语句：

```python
nums = [1, 2, 3, 4]
del nums[1]
print(nums) # [1, 3, 4]
```

### 高级特性

#### 切片

在使用list的时候，我们可能会经常需要取出list的某一部分元素，如果用循环去取的话非常笨重，Python为我们提供了一个非常方便的方法取出list的一部分，那就是切片。

```python
list[start:end:step]
```

切片方法可以有三个参数：

- start：起始位置（需要截取的list的开始位置）
- end：结束位置（需要截取的list的结束位置，结果不包括该位置的值）
- step：步长（每个步长取一个元素，默认为1）

```python
nums = [1, 2, 3, 4, 5, 6, 7]

# 从索引3开始取，到索引5为止
nums[3:5] # [4, 5]

# 从第0个元素开始，直到最后一个元素，每两个元素取一个
nums[::2] # [1, 3, 5, 7]

# 索引也可以使用负数表示
nums[-3:-1] # [5, 6]
```

#### 重复列表

在Python中，如果要创建一个长度为10的list，并其list的每个元素全初始化为0，应该怎么做？

在其他的语言中你可能是使用循环来创建，但是在Python中只要一行代码就可以轻松创建：

```python
nums = [0] * 10 # [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```

#### 判断元素是否在列表中

在Python中可以使用 `in` 操作符判断一个元素是否存在于一个列表中：

```python
names = ['Allen', 'Youngor', 'Lvy']
print('Allen' in names) # True
```

#### 组合列表

在Python中，我们可以使用 `+` 运算符将两个list组合在一起，像连接两个字符串一样：

```python
num1 = [1, 2, 3]
num2 = [4, 5, 6]
print(num1 + num2) # [1, 2, 3, 4, 5, 6]
```

#### 列表生成式

要生成一些简单的列表我们可以通过 `list(range(10))` 这种方式，但是如果我们需要一个幂数列的列表呢？

在其他语言中，我们只能通过循环的方式来生成，但是在python中却有一种更简单的方式来生成这种复杂的列表，那就是列表生成式：

```python
l = [x * x for x in range(1,10)]
print(l) # [1, 4, 9, 16, 25, 36, 49, 64, 81]
```

for循环后面还可以加上if判断，这样我们可以快速的选出我们想要的数据：

```python
l = [x * x for x in range(1,10) if x % 3 == 0]
print(l) # [9, 36, 81]
```

还可以使用两层循环，可以生成全排列：

```python
l = [m + n for m in 'ABC' for n in 'XYZ']
print(l) # ['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ']
```

### 常用方法

#### append()

`append(value)` 方法向list末尾追加一个元素：

```python
names.append('Lvy') # ['Allen', 'Youngor', 'Jack', 'Lvy']
```

#### insert()

`insert(index, value)` 方法把元素插入到list中指定的位置：

```python
names.insert(1, 'Bob') # ['Allen', 'Bob', 'Youngor', 'Jack']
```

#### pop()

`pop(index)` 方法删除ist中指定位置的元素，如果要删除末尾的元素，则可以不传入索引位置。该方法返回删除的元素的值：

```python
names.pop(1) # 'Youngor'
names.pop() # 'Jack'
```

#### count()

`count(value)` 方法用作统计某个元素在列表中出现的次数：

```python
names.count('Allen') # 1
```

#### remove()

`remove(value)` 方法移除列表中某个值的第一个匹配项：

```python
names.remove('Allen')
print(names) # ['Youngor', 'Jack']
```

如果该元素不在列表中，则会报错：

```python
names.remove('Tom') # ValueError: list.remove(x): x not in list
```

#### reverse()

`reverse()` 方法反向列表中元素

```python
names.reverse()
print(names) # ['Jack', 'Youngor', 'Allen']
```

#### index()

`index(value)` 方法从列表中找出某个值第一个匹配项的索引位置，如果列表中存在该值，返回该值的索引。如果该值不存在，抛出一个 `ValueError`

```python
names = ['Allen', 'Youngor', 'Jack']
print(names.index('Allen')) # 0
print(names.index('Tom')) # ValueError: 'Tom' is not in list
```

#### extend()

`extend(obj)` 方法在列表末尾一次性追加另一个序列中的多个值（用新列表扩展原来的列表），需要传入的参数是一个可迭代对象：

```python
names = ['Allen', 'Youngor', 'Jack']
names.extend('123')
print(names) # ['Allen', 'Youngor', 'Jack', '1', '2', '3']
```

#### clear()

`clear()` 方法清除列表中所有的元素：

```python
names.clear()
print(names) # []
```

#### copy()

`copy()` 方法用于拷贝一个list（深拷贝）：

```python
names = ['Allen', 'Youngor', 'Jack']
names_copy = names.copy()
names.append('Tim')
print(names_copy) # ['Allen', 'Youngor', 'Jack']
print(names) # ['Allen', 'Youngor', 'Jack', 'Tim']
```

#### sort()

`sort(fun)` 方法对列表进行排序：

```python
nums = [1, 23, 34, 2, 56, 5, 4]
nums.sort()
print(nums) # [1, 2, 4, 5, 23, 34, 56]
```

## tuple

tuple和list非常相似，但是tuple一旦初始化就不能修改，所以tuple必须在定义的时候就初始化完成。

同样表示姓名的tuple:

```python
names = ('Allen', 'Youngor', 'Jack')
```

同list一样，我们也可以通过索引取得tuple的元素的值：

```python
names[0] # 'Allen'
```

如果要定义一个只有一个元素的tuple，必须在结尾加一个`,`来消除歧义，因为`()`既可以表示tuple又可以表示数学公式中的小括号：

```python
num = (1) # 1
num = (1,) # (1,)
```
