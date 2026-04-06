import styled from "styled-components";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/endpoints";

const Nav = styled.header`
  height: 52px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  flex-shrink: 0;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.3px;

  span {
    font-size: 1.2rem;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled.span`
  font-size: 0.82rem;
  color: var(--text-secondary);
`;

const LogoutBtn = styled.button`
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  color: var(--text-secondary);
  transition: all var(--transition);

  &:hover {
    border-color: var(--red);
    color: var(--red);
  }
`;

export default function Navbar() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
    }
  };

  return (
    <Nav>
      <Brand>
        <span>📈</span> TradeDash
      </Brand>
      <Right>
        {user && <UserName>{user.name}</UserName>}
        <LogoutBtn onClick={handleLogout}>Sign out</LogoutBtn>
      </Right>
    </Nav>
  );
}
