# 구현 상세 추상화하기

## 요약

저수준 구현 상세를 함수나 변수로 추상화하여, 코드를 읽을 때 "무엇을" 하는지에 집중할 수 있게 한다.

## 문제 상황

구현의 세부 사항이 그대로 노출되면 코드의 의도를 파악하기 위해 모든 로직을 읽어야 한다.

## 나쁜 예시

```tsx
function ProductPage() {
  const products = useProducts();

  return (
    <div>
      {products
        .filter(p => p.stock > 0 && p.status === 'active' && !p.isDeleted)
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 10)
        .map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
    </div>
  );
}
```

**문제점**: 필터링, 정렬, 슬라이싱의 의도가 명확하지 않다.

## 좋은 예시

```tsx
function ProductPage() {
  const products = useProducts();
  const displayProducts = getTopSellingActiveProducts(products, 10);

  return (
    <div>
      {displayProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function getTopSellingActiveProducts(products: Product[], limit: number) {
  return products
    .filter(isActiveProduct)
    .sort(bySalesCountDescending)
    .slice(0, limit);
}

function isActiveProduct(product: Product) {
  return product.stock > 0 && product.status === 'active' && !product.isDeleted;
}

function bySalesCountDescending(a: Product, b: Product) {
  return b.salesCount - a.salesCount;
}
```

**개선점**: 함수 이름만으로 의도를 파악할 수 있다.

## 핵심 포인트

- "어떻게"가 아닌 "무엇을" 드러내는 이름 사용
- 복잡한 조건은 의미 있는 함수로 추출
- 추상화 수준을 일관되게 유지

## 참고

- [Toss Frontend Fundamentals - 구현 상세 추상화하기](https://frontend-fundamentals.com/code-quality/en/)
