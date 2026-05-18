import ForgotPasswordForm from '../components/ForgotPasswordForm';

export default function ForgotPasswordPage() {

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--surface)',
      backgroundImage: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
      padding: '48px 16px',
      overflow: 'hidden',
      fontFamily: 'var(--font-ui)',
    },
    wrapper: {
      maxWidth: '480px',
      width: '100%',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
