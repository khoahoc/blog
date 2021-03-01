import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

const features = [
  {
    title: "Làm Việc",
    imageUrl: "img/undraw_docusaurus_mountain.svg",
    description: (
      <>
        Làm việc là <code>điều kiện cần</code> để chúng ta có thể thực hiện
        những <code>điều kiện đủ</code>.
      </>
    ),
  },
  {
    title: "Học Tập",
    imageUrl: "img/undraw_docusaurus_tree.svg",
    description: (
      <>
        Có rất nhiều thứ hay ho trên <u>Internet</u>. Nhưng điều đầu tiên là
        phải có <code>kiến thức cơ bản</code> để dễ dàng học thêm và chia sẽ.
      </>
    ),
  },
  {
    title: "Thực Hành",
    imageUrl: "img/undraw_docusaurus_react.svg",
    description: (
      <>
        Làm những việc bình thường một cách chắc chắn là{" "}
        <code>siêu thường</code> cũng là điều mà tôi hướng tới.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx("col col--4", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`${siteConfig.title} Persional Website`}
      description="Description will go into a meta tag in <head />"
    >
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                "button button--outline button--secondary button--lg",
                styles.getStarted
              )}
              to={useBaseUrl("blog/")}
            >
              Đọc Blog Cá Nhân
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
