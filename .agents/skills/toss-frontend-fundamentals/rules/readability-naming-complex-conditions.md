# 복잡한 조건에 이름 붙이기

## 요약

여러 조건이 결합된 복잡한 조건식에는 의미 있는 변수명을 부여하여 코드의 의도를 명확히 드러낸다.

## 문제 상황

사람의 뇌가 한 번에 처리할 수 있는 정보는 제한적이다(약 6개). 복잡한 조건이 인라인으로 작성되면 의도 파악이 어렵다.

## 나쁜 예시

```tsx
function ProductList({ products, filters }) {
  return (
    <ul>
      {products
        .filter(
          p =>
            p.category === filters.category &&
            p.price >= filters.minPrice &&
            p.price <= filters.maxPrice &&
            p.stock > 0 &&
            !p.isDiscontinued
        )
        .map(product => (
          <ProductItem key={product.id} product={product} />
        ))}
    </ul>
  );
}
```

**문제점**: 필터 조건의 의도가 명확하지 않고, 각 조건이 무엇을 의미하는지 해석해야 한다.

## 좋은 예시

```tsx
function ProductList({ products, filters }) {
  const availableProducts = products.filter(product => {
    const isSameCategory = product.category === filters.category;
    const isPriceInRange =
      product.price >= filters.minPrice && product.price <= filters.maxPrice;
    const isInStock = product.stock > 0;
    const isActive = !product.isDiscontinued;

    return isSameCategory && isPriceInRange && isInStock && isActive;
  });

  return (
    <ul>
      {availableProducts.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </ul>
  );
}
```

**개선점**: 각 조건의 의미가 변수명으로 드러나 읽기 쉽다.

## 이름 붙이기 기준

**필요한 경우:**
- 복잡한 다중 조건
- 여러 곳에서 재사용되는 조건
- 비즈니스 규칙을 표현하는 조건

**불필요한 경우:**
- `arr.filter(x => x > 0)` 같은 단순 조건
- 한 번만 사용되고 의미가 명확한 경우

## 핵심 포인트

- `is`, `has`, `should` 등의 접두사로 boolean 의미 전달
- 부정 조건보다 긍정 조건 선호 (`isActive` > `isNotDeleted`)
- 너무 긴 이름보다 적절한 추상화 수준 선택

## 참고

- [Toss Frontend Fundamentals - 복잡한 조건에 이름 붙이기](https://frontend-fundamentals.com/code-quality/en/code/examples/condition-name)
