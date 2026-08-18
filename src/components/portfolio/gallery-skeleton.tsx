import styles from './gallery.module.css'

export function GallerySkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={styles.carousel} aria-hidden="true">
      <div className={styles.track}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className={`${styles.card} ${styles.skeleton}`} />
        ))}
      </div>
    </div>
  )
}
