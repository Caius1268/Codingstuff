#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define MAX_MOVES 512
#define MAX_HISTORY 256
#define INF 1000000
#define MATE 900000

/* =========================================================
   CHESS V20
   ---------------------------------------------------------
   Human vs Human
   Human vs Computer
   Minimax + Alpha-Beta
   Castling
   En Passant
   Promotion
   Check / Checkmate / Stalemate
   Undo
   Move History
   Save / Load
   ========================================================= */


/* =========================================================
   DATA STRUCTURES
   ========================================================= */

typedef struct {
    int fr, fc;
    int tr, tc;
    char promotion;

    int castle;
    int enPassant;
} Move;


typedef struct {
    char board[8][8];

    int whiteTurn;

    int wKingMoved;
    int bKingMoved;

    int wRookKingMoved;
    int wRookQueenMoved;

    int bRookKingMoved;
    int bRookQueenMoved;

    int epRow;
    int epCol;
} Game;


typedef struct {
    Game state;
    Move move;
} History;


/* =========================================================
   BASIC FUNCTIONS
   ========================================================= */

int inside(int r, int c) {
    return r >= 0 && r < 8 &&
           c >= 0 && c < 8;
}


int whitePiece(char p) {
    return p >= 'A' && p <= 'Z';
}


int blackPiece(char p) {
    return p >= 'a' && p <= 'z';
}


int sameSide(char p, int white) {
    if (p == ' ')
        return 0;

    return white ? whitePiece(p) : blackPiece(p);
}


int enemyPiece(char p, int white) {
    if (p == ' ')
        return 0;

    return white ? blackPiece(p) : whitePiece(p);
}


/* =========================================================
   INITIALIZE GAME
   ========================================================= */

void initGame(Game *g) {

    char board[8][8] = {
        {'r','n','b','q','k','b','n','r'},
        {'p','p','p','p','p','p','p','p'},
        {' ',' ',' ',' ',' ',' ',' ',' '},
        {' ',' ',' ',' ',' ',' ',' ',' '},
        {' ',' ',' ',' ',' ',' ',' ',' '},
        {' ',' ',' ',' ',' ',' ',' ',' '},
        {'P','P','P','P','P','P','P','P'},
        {'R','N','B','Q','K','B','N','R'}
    };

    memcpy(g->board, board, sizeof(board));

    g->whiteTurn = 1;

    g->wKingMoved = 0;
    g->bKingMoved = 0;

    g->wRookKingMoved = 0;
    g->wRookQueenMoved = 0;

    g->bRookKingMoved = 0;
    g->bRookQueenMoved = 0;

    g->epRow = -1;
    g->epCol = -1;
}


/* =========================================================
   BOARD DISPLAY
   ========================================================= */

void printBoard(Game *g) {

    printf("\n");
    printf("        a   b   c   d   e   f   g   h\n");
    printf("      +---+---+---+---+---+---+---+---+\n");

    for (int r = 0; r < 8; r++) {

        printf("   %d  |", 8 - r);

        for (int c = 0; c < 8; c++) {

            char p = g->board[r][c];

            if (p == ' ')
                printf("   |");
            else
                printf(" %c |", p);
        }

        printf("  %d\n", 8 - r);

        printf("      +---+---+---+---+---+---+---+---+\n");
    }

    printf("        a   b   c   d   e   f   g   h\n");
}


/* =========================================================
   PATH CHECK
   ========================================================= */

int pathClear(Game *g,
              int fr, int fc,
              int tr, int tc) {

    int dr = 0;
    int dc = 0;

    if (tr > fr)
        dr = 1;
    else if (tr < fr)
        dr = -1;

    if (tc > fc)
        dc = 1;
    else if (tc < fc)
        dc = -1;

    int r = fr + dr;
    int c = fc + dc;

    while (r != tr || c != tc) {

        if (g->board[r][c] != ' ')
            return 0;

        r += dr;
        c += dc;
    }

    return 1;
}


/* =========================================================
   FIND KING
   ========================================================= */

int findKing(Game *g,
             int white,
             int *kr,
             int *kc) {

    char king = white ? 'K' : 'k';

    for (int r = 0; r < 8; r++) {

        for (int c = 0; c < 8; c++) {

            if (g->board[r][c] == king) {

                *kr = r;
                *kc = c;

                return 1;
            }
        }
    }

    return 0;
}


/* =========================================================
   ATTACK DETECTION
   ========================================================= */

int attacks(Game *g,
            int fr, int fc,
            int tr, int tc) {

    char p = g->board[fr][fc];

    int dr = tr - fr;
    int dc = tc - fc;

    int adr = abs(dr);
    int adc = abs(dc);


    /* Pawn */

    if (p == 'P')
        return dr == -1 && adc == 1;

    if (p == 'p')
        return dr == 1 && adc == 1;


    /* Knight */

    if (p == 'N' || p == 'n') {

        return (adr == 2 && adc == 1) ||
               (adr == 1 && adc == 2);
    }


    /* King */

    if (p == 'K' || p == 'k') {

        return adr <= 1 &&
               adc <= 1 &&
               adr + adc > 0;
    }


    /* Rook */

    if (p == 'R' || p == 'r') {

        if (dr == 0 || dc == 0)
            return pathClear(
                g, fr, fc, tr, tc
            );

        return 0;
    }


    /* Bishop */

    if (p == 'B' || p == 'b') {

        if (adr == adc)
            return pathClear(
                g, fr, fc, tr, tc
            );

        return 0;
    }


    /* Queen */

    if (p == 'Q' || p == 'q') {

        if (dr == 0 ||
            dc == 0 ||
            adr == adc)
            return pathClear(
                g, fr, fc, tr, tc
            );

        return 0;
    }

    return 0;
}


/* =========================================================
   CHECK
   ========================================================= */

int inCheck(Game *g, int white) {

    int kr, kc;

    if (!findKing(
            g,
            white,
            &kr,
            &kc))
        return 1;

    for (int r = 0; r < 8; r++) {

        for (int c = 0; c < 8; c++) {

            char p = g->board[r][c];

            if (white && blackPiece(p)) {

                if (attacks(
                        g, r, c, kr, kc))
                    return 1;
            }

            if (!white && whitePiece(p)) {

                if (attacks(
                        g, r, c, kr, kc))
                    return 1;
            }
        }
    }

    return 0;
}


/* =========================================================
   NORMAL MOVEMENT
   ========================================================= */

int normalValid(Game *g,
                int fr, int fc,
                int tr, int tc,
                int white) {

    char p = g->board[fr][fc];
    char target = g->board[tr][tc];

    int dr = tr - fr;
    int dc = tc - fc;

    int adr = abs(dr);
    int adc = abs(dc);


    if (!inside(tr, tc))
        return 0;


    if (target != ' ' &&
        !enemyPiece(target, white))
        return 0;


    /* Pawn */

    if (p == 'P' || p == 'p') {

        int dir = (p == 'P') ? -1 : 1;
        int start = (p == 'P') ? 6 : 1;


        if (dc == 0 &&
            dr == dir &&
            target == ' ')
            return 1;


        if (dc == 0 &&
            fr == start &&
            dr == 2 * dir &&
            target == ' ' &&
            g->board[fr + dir][fc] == ' ')
            return 1;


        if (adc == 1 &&
            dr == dir &&
            target != ' ' &&
            enemyPiece(target, white))
            return 1;


        return 0;
    }


    /* Rook */

    if (p == 'R' || p == 'r') {

        if (dr == 0 || dc == 0)
            return pathClear(
                g, fr, fc, tr, tc
            );

        return 0;
    }


    /* Bishop */

    if (p == 'B' || p == 'b') {

        if (adr == adc)
            return pathClear(
                g, fr, fc, tr, tc
            );

        return 0;
    }


    /* Queen */

    if (p == 'Q' || p == 'q') {

        if (dr == 0 ||
            dc == 0 ||
            adr == adc)
            return pathClear(
                g, fr, fc, tr, tc
            );

        return 0;
    }


    /* Knight */

    if (p == 'N' || p == 'n') {

        return
            (adr == 2 && adc == 1) ||
            (adr == 1 && adc == 2);
    }


    /* King */

    if (p == 'K' || p == 'k') {

        return adr <= 1 &&
               adc <= 1 &&
               adr + adc > 0;
    }


    return 0;
}


/* =========================================================
   MAKE MOVE
   ========================================================= */

void makeMove(Game *g, Move m) {

    char p = g->board[m.fr][m.fc];

    /* Reset en passant */

    g->epRow = -1;
    g->epCol = -1;


    /* En passant */

    if (m.enPassant) {

        g->board[m.tr][m.tc] = p;
        g->board[m.fr][m.fc] = ' ';

        if (p == 'P')
            g->board[m.tr + 1][m.tc] = ' ';
        else
            g->board[m.tr - 1][m.tc] = ' ';
    }


    /* Castling */

    else if (m.castle) {

        int row = m.fr;

        g->board[m.tr][m.tc] = p;
        g->board[m.fr][m.fc] = ' ';


        if (m.tc == 6) {

            g->board[row][5] =
                g->board[row][7];

            g->board[row][7] = ' ';

        } else {

            g->board[row][3] =
                g->board[row][0];

            g->board[row][0] = ' ';
        }
    }


    /* Normal */

    else {

        g->board[m.tr][m.tc] = p;
        g->board[m.fr][m.fc] = ' ';


        /* Double pawn move */

        if ((p == 'P' || p == 'p') &&
            abs(m.tr - m.fr) == 2) {

            g->epRow =
                (m.fr + m.tr) / 2;

            g->epCol = m.fc;
        }


        /* Promotion */

        if (p == 'P' && m.tr == 0) {

            g->board[m.tr][m.tc] =
                m.promotion ?
                m.promotion : 'Q';
        }


        if (p == 'p' && m.tr == 7) {

            char x =
                m.promotion ?
                m.promotion : 'Q';

            g->board[m.tr][m.tc] =
                x + 32;
        }
    }


    /* Castling rights */

    if (p == 'K')
        g->wKingMoved = 1;

    if (p == 'k')
        g->bKingMoved = 1;


    if (p == 'R' &&
        m.fr == 7 &&
        m.fc == 7)
        g->wRookKingMoved = 1;


    if (p == 'R' &&
        m.fr == 7 &&
        m.fc == 0)
        g->wRookQueenMoved = 1;


    if (p == 'r' &&
        m.fr == 0 &&
        m.fc == 7)
        g->bRookKingMoved = 1;


    if (p == 'r' &&
        m.fr == 0 &&
        m.fc == 0)
        g->bRookQueenMoved = 1;


    /* Rook captured */

    if (m.tr == 7 && m.tc == 7)
        g->wRookKingMoved = 1;

    if (m.tr == 7 && m.tc == 0)
        g->wRookQueenMoved = 1;

    if (m.tr == 0 && m.tc == 7)
        g->bRookKingMoved = 1;

    if (m.tr == 0 && m.tc == 0)
        g->bRookQueenMoved = 1;


    g->whiteTurn =
        !g->whiteTurn;
}


/* =========================================================
   CASTLING
   ========================================================= */

int castleLegal(Game *g,
                int fr, int fc,
                int tr, int tc,
                int white) {

    int row = white ? 7 : 0;

    if (fr != row ||
        fc != 4 ||
        tr != row)
        return 0;


    if (tc != 2 &&
        tc != 6)
        return 0;


    if (white && g->wKingMoved)
        return 0;

    if (!white && g->bKingMoved)
        return 0;


    if (inCheck(g, white))
        return 0;


    /* King side */

    if (tc == 6) {

        if (white &&
            g->wRookKingMoved)
            return 0;

        if (!white &&
            g->bRookKingMoved)
            return 0;


        if (g->board[row][7] !=
            (white ? 'R' : 'r'))
            return 0;


        if (g->board[row][5] != ' ' ||
            g->board[row][6] != ' ')
            return 0;


        return 1;
    }


    /* Queen side */

    if (white &&
        g->wRookQueenMoved)
        return 0;

    if (!white &&
        g->bRookQueenMoved)
        return 0;


    if (g->board[row][0] !=
        (white ? 'R' : 'r'))
        return 0;


    if (g->board[row][1] != ' ' ||
        g->board[row][2] != ' ' ||
        g->board[row][3] != ' ')
        return 0;


    return 1;
}


/* =========================================================
   LEGAL MOVE
   ========================================================= */

int legalMove(Game *g, Move m) {

    int white = g->whiteTurn;

    char p =
        g->board[m.fr][m.fc];


    if (!inside(m.fr, m.fc) ||
        !inside(m.tr, m.tc))
        return 0;


    if (!sameSide(p, white))
        return 0;


    /* Castling */

    if (m.castle) {

        if (!castleLegal(
                g,
                m.fr,
                m.fc,
                m.tr,
                m.tc,
                white))
            return 0;


        /*
        Test the king's intermediate square.
        */

        Game temp = *g;

        Move step = m;

        step.castle = 0;

        step.tr = m.fr;

        step.tc =
            (m.tc == 6) ? 5 : 3;

        makeMove(
            &temp,
            step
        );

        temp.whiteTurn = white;


        if (inCheck(
                &temp,
                white))
            return 0;


        makeMove(
            &temp,
            m
        );

        temp.whiteTurn = white;


        if (inCheck(
                &temp,
                white))
            return 0;


        return 1;
    }


    /* En passant */

    if ((p == 'P' ||
         p == 'p') &&

        g->board[m.tr][m.tc] == ' ' &&

        abs(m.tc - m.fc) == 1) {

        if (!(m.tr == g->epRow &&
              m.tc == g->epCol))
            return 0;
    }


    if (!normalValid(
            g,
            m.fr,
            m.fc,
            m.tr,
            m.tc,
            white))
        return 0;


    Game temp = *g;

    makeMove(
        &temp,
        m
    );

    temp.whiteTurn = white;


    if (inCheck(
            &temp,
            white))
        return 0;


    return 1;
}


/* =========================================================
   MOVE GENERATION
   ========================================================= */

int generateMoves(Game *g,
                  Move moves[]) {

    int count = 0;

    int white =
        g->whiteTurn;


    for (int fr = 0; fr < 8; fr++) {

        for (int fc = 0; fc < 8; fc++) {

            char p =
                g->board[fr][fc];


            if (!sameSide(
                    p,
                    white))
                continue;


            for (int tr = 0; tr < 8; tr++) {

                for (int tc = 0; tc < 8; tc++) {

                    Move m;

                    m.fr = fr;
                    m.fc = fc;

                    m.tr = tr;
                    m.tc = tc;

                    m.promotion = 0;

                    m.castle = 0;
                    m.enPassant = 0;


                    /* Castling */

                    if ((p == 'K' ||
                         p == 'k') &&

                        fc == 4 &&
                        fr == tr &&

                        (tc == 2 ||
                         tc == 6)) {

                        m.castle = 1;

                        if (legalMove(
                                g, m)) {

                            moves[count++] =
                                m;
                        }

                        continue;
                    }


                    /* Promotion */

                    if ((p == 'P' &&
                         tr == 0) ||

                        (p == 'p' &&
                         tr == 7)) {

                        char choices[] =
                            {'Q','R','B','N'};


                        for (int i = 0;
                             i < 4;
                             i++) {

                            m.promotion =
                                choices[i];


                            if (legalMove(
                                    g, m)) {

                                moves[count++] =
                                    m;
                            }
                        }

                        continue;
                    }


                    /* En passant */

                    if ((p == 'P' ||
                         p == 'p') &&

                        g->board[tr][tc] == ' ' &&

                        abs(tc - fc) == 1 &&

                        tr == g->epRow &&
                        tc == g->epCol) {

                        m.enPassant = 1;
                    }


                    if (legalMove(
                            g, m)) {

                        moves[count++] = m;
                    }
                }
            }
        }
    }

    return count;
}


/* =========================================================
   PIECE VALUES
   ========================================================= */

int pieceValue(char p) {

    switch (p) {

        case 'P':
        case 'p':
            return 100;

        case 'N':
        case 'n':
            return 320;

        case 'B':
        case 'b':
            return 330;

        case 'R':
        case 'r':
            return 500;

        case 'Q':
        case 'q':
            return 900;

        case 'K':
        case 'k':
            return 20000;

        default:
            return 0;
    }
}


/* =========================================================
   EVALUATION
   ========================================================= */

int evaluate(Game *g) {

    int score = 0;


    for (int r = 0; r < 8; r++) {

        for (int c = 0; c < 8; c++) {

            char p =
                g->board[r][c];


            if (p == ' ')
                continue;


            int v =
                pieceValue(p);


            /* Center control */

            int center = 0;

            if (r >= 2 &&
                r <= 5 &&
                c >= 2 &&
                c <= 5)
                center = 15;


            if (blackPiece(p))
                score += v + center;

            else
                score -= v + center;
        }
    }


    /*
    Positive = good for Black.
    Negative = good for White.
    */

    return score;
}


/* =========================================================
   MOVE ORDERING
   ========================================================= */

int moveScore(Game *g,
              Move m) {

    int score = 0;

    char target =
        g->board[m.tr][m.tc];


    if (target != ' ')
        score +=
            pieceValue(target);


    if (m.promotion)
        score += 800;


    if (m.castle)
        score += 50;


    if (m.tr >= 2 &&
        m.tr <= 5 &&
        m.tc >= 2 &&
        m.tc <= 5)
        score += 10;


    return score;
}


void sortMoves(Game *g,
               Move moves[],
               int count) {

    for (int i = 0;
         i < count - 1;
         i++) {

        int best = i;


        for (int j = i + 1;
             j < count;
             j++) {

            if (moveScore(
                    g,
                    moves[j])
                >
                moveScore(
                    g,
                    moves[best])) {

                best = j;
            }
        }


        if (best != i) {

            Move temp =
                moves[i];

            moves[i] =
                moves[best];

            moves[best] =
                temp;
        }
    }
}


/* =========================================================
   MINIMAX
   ========================================================= */

int minimax(Game *g,
            int depth,
            int alpha,
            int beta) {

    Move moves[MAX_MOVES];

    int count =
        generateMoves(
            g,
            moves
        );


    /* End of game */

    if (count == 0) {

        if (inCheck(
                g,
                g->whiteTurn)) {

            if (g->whiteTurn)
                return MATE + depth;

            return -MATE - depth;
        }

        return 0;
    }


    if (depth == 0)
        return evaluate(g);


    sortMoves(
        g,
        moves,
        count
    );


    /* Black maximizes */

    if (!g->whiteTurn) {

        int best = -INF;


        for (int i = 0;
             i < count;
             i++) {

            Game next = *g;

            makeMove(
                &next,
                moves[i]
            );


            int score =
                minimax(
                    &next,
                    depth - 1,
                    alpha,
                    beta
                );


            if (score > best)
                best = score;


            if (best > alpha)
                alpha = best;


            if (beta <= alpha)
                break;
        }


        return best;
    }


    /* White minimizes */

    else {

        int best = INF;


        for (int i = 0;
             i < count;
             i++) {

            Game next = *g;

            makeMove(
                &next,
                moves[i]
            );


            int score =
                minimax(
                    &next,
                    depth - 1,
                    alpha,
                    beta
                );


            if (score < best)
                best = score;


            if (best < beta)
                beta = best;


            if (beta <= alpha)
                break;
        }


        return best;
    }
}


/* =========================================================
   COMPUTER MOVE
   ========================================================= */

Move computerMove(Game *g,
                  int depth) {

    Move moves[MAX_MOVES];

    int count =
        generateMoves(
            g,
            moves
        );


    sortMoves(
        g,
        moves,
        count
    );


    Move best =
        moves[0];


    int bestScore =
        -INF;


    for (int i = 0;
         i < count;
         i++) {

        Game next = *g;

        makeMove(
            &next,
            moves[i]
        );


        int score =
            minimax(
                &next,
                depth - 1,
                -INF,
                INF
            );


        if (score > bestScore) {

            bestScore = score;
            best = moves[i];

        } else if (score == bestScore) {

            if (rand() % 2 == 0)
                best = moves[i];
        }
    }


    return best;
}


/* =========================================================
   MOVE NOTATION
   ========================================================= */

void printMove(Move m) {

    printf(
        "%c%d-%c%d",
        'a' + m.fc,
        8 - m.fr,
        'a' + m.tc,
        8 - m.tr
    );


    if (m.promotion)
        printf(
            "=%c",
            m.promotion
        );


    if (m.castle)
        printf(
            " (castle)"
        );


    if (m.enPassant)
        printf(
            " (en passant)"
        );
}


/* =========================================================
   POSITION PARSER
   ========================================================= */
   int parsePosition(char *s,
                  int *r,
                  int *c) {

    if (strlen(s) != 2)
        return 0;


    if (s[0] < 'a' ||
        s[0] > 'h')
        return 0;


    if (s[1] < '1' ||
        s[1] > '8')
        return 0;


    *c =
        s[0] - 'a';

    *r =
        8 - (s[1] - '0');


    return 1;
}


/* =========================================================
   SAVE GAME
   ========================================================= */

void saveGame(Game *g) {

    FILE *file =
        fopen(
            "chess_save.dat",
            "wb"
        );


    if (!file) {

        printf(
            "Could not save game.\n"
        );

        return;
    }


    fwrite(
        g,
        sizeof(Game),
        1,
        file
    );


    fclose(file);


    printf(
        "\nGame saved successfully!\n"
    );
}


/* =========================================================
   LOAD GAME
   ========================================================= */

int loadGame(Game *g) {

    FILE *file =
        fopen(
            "chess_save.dat",
            "rb"
        );


    if (!file) {

        printf(
            "\nNo saved game found.\n"
        );

        return 0;
    }


    fread(
        g,
        sizeof(Game),
        1,
        file
    );


    fclose(file);


    printf(
        "\nGame loaded successfully!\n"
    );


    return 1;
}


/* =========================================================
   INSTRUCTIONS
   ========================================================= */

void instructions() {

    printf("\n");
    printf("========================================\n");
    printf("             HOW TO PLAY\n");
    printf("========================================\n");

    printf("\n");
    printf("Enter moves like:\n");
    printf("    e2 e4\n\n");

    printf("Board coordinates:\n");
    printf("    a1 through h8\n\n");

    printf("Special moves supported:\n");
    printf("    Castling\n");
    printf("    En passant\n");
    printf("    Promotion\n\n");

    printf("During a game:\n");
    printf("    u = undo\n");
    printf("    s = save\n");
    printf("    l = load\n");
    printf("    h = history\n");
    printf("    q = quit\n");

    printf("\n");
}


/* =========================================================
   SHOW HISTORY
   ========================================================= */

void showHistory(History history[],
                 int count) {

    printf("\n");
    printf("========================================\n");
    printf("             MOVE HISTORY\n");
    printf("========================================\n");


    if (count == 0) {

        printf(
            "No moves yet.\n"
        );

        return;
    }


    for (int i = 0;
         i < count;
         i++) {

        printf(
            "%3d. ",
            i + 1
        );

        printMove(
            history[i].move
        );

        printf("\n");
    }
}


/* =========================================================
   HUMAN MOVE
   ========================================================= */

int humanTurn(Game *g,
              History history[],
              int *historyCount) {

    char from[20];
    char to[20];


    printf("\n");
    printf("Move: ");


    scanf(
        "%19s",
        from
    );


    /* Commands */

    if (strcmp(
            from,
            "q") == 0)
        return -1;


    if (strcmp(
            from,
            "u") == 0) {

        if (*historyCount > 0) {

            *g =
                history[
                    *historyCount - 1
                ].state;

            (*historyCount)--;

            printf(
                "Move undone.\n"
            );

        } else {

            printf(
                "Nothing to undo.\n"
            );
        }

        return 0;
    }


    if (strcmp(
            from,
            "s") == 0) {

        saveGame(g);

        return 0;
    }


    if (strcmp(
            from,
            "l") == 0) {

        loadGame(g);

        return 0;
    }


    if (strcmp(
            from,
            "h") == 0) {

        showHistory(
            history,
            *historyCount
        );

        return 0;
    }


    scanf(
        "%19s",
        to
    );


    int fr, fc;
    int tr, tc;


    if (!parsePosition(
            from,
            &fr,
            &fc) ||

        !parsePosition(
            to,
            &tr,
            &tc)) {

        printf(
            "Invalid coordinates.\n"
        );

        return 0;
    }


    Move m;

    m.fr = fr;
    m.fc = fc;

    m.tr = tr;
    m.tc = tc;

    m.promotion = 0;

    m.castle = 0;
    m.enPassant = 0;


    char p =
        g->board[fr][fc];


    /* Castling */

    if ((p == 'K' ||
         p == 'k') &&
        fc == 4 &&
        fr == tr &&
        (tc == 2 ||
         tc == 6)) {

        m.castle = 1;
    }


    /* En passant */

    if ((p == 'P' ||
         p == 'p') &&

        g->board[tr][tc] == ' ' &&

        abs(tc - fc) == 1 &&

        tr == g->epRow &&
        tc == g->epCol) {

        m.enPassant = 1;
    }


    /* Promotion */

    if ((p == 'P' &&
         tr == 0) ||

        (p == 'p' &&
         tr == 7)) {

        char choice[10];

        printf(
            "Promote to Q/R/B/N: "
        );

        scanf(
            "%9s",
            choice
        );


        char x =
            choice[0];


        if (x >= 'a' &&
            x <= 'z')
            x -= 32;


        if (x == 'Q' ||
            x == 'R' ||
            x == 'B' ||
            x == 'N')
            m.promotion = x;
        else
            m.promotion = 'Q';
    }


    if (!legalMove(
            g,
            m)) {

        printf(
            "INVALID MOVE!\n"
        );

        return 0;
    }


    /*
    Store state BEFORE move.
    */

    if (*historyCount <
        MAX_HISTORY) {

        history[
            *historyCount
        ].state = *g;

        history[
            *historyCount
        ].move = m;

        (*historyCount)++;
    }


    makeMove(
        g,
        m
    );


    printf(
        "Played: "
    );

    printMove(m);

    printf("\n");


    return 1;
}


/* =========================================================
   GAME OVER CHECK
   ========================================================= */

int checkGameOver(Game *g) {

    Move moves[MAX_MOVES];

    int count =
        generateMoves(
            g,
            moves
        );


    if (count > 0)
        return 0;


    printf("\n");


    if (inCheck(
            g,
            g->whiteTurn)) {

        printf(
            "========================================\n"
        );

        printf(
            "              CHECKMATE!\n"
        );

        printf(
            "========================================\n"
        );


        if (g->whiteTurn)
            printf(
                "BLACK WINS!\n"
            );
        else
            printf(
                "WHITE WINS!\n"
            );

    } else {

        printf(
            "========================================\n"
        );

        printf(
            "               STALEMATE\n"
        );

        printf(
            "                 DRAW\n"
        );

        printf(
            "========================================\n"
        );
    }


    return 1;
}


/* =========================================================
   START MENU
   ========================================================= */
int menu() {

    int choice;


    printf("\n");
    printf("========================================\n");
    printf("             CHESS V20\n");
    printf("========================================\n");

    printf("\n");

    printf("1. Human vs Human\n");
    printf("2. Human vs Computer\n");
    printf("3. Load Saved Game\n");
    printf("4. Instructions\n");
    printf("5. Exit\n");

    printf("\nChoice: ");

    scanf(
        "%d",
        &choice
    );


    return choice;
}


/* =========================================================
   MAIN GAME
   ========================================================= */

void playGame(int mode,
              int loaded) {

    Game game;

    History history[MAX_HISTORY];

    int historyCount = 0;


    if (loaded) {

        if (!loadGame(
                &game))
            initGame(
                &game
            );

    } else {

        initGame(
            &game
        );
    }


    /*
    AI depth.

    2 = faster
    3 = balanced
    4 = stronger but slower
    */

    int aiDepth = 3;


    while (1) {

        printBoard(
            &game
        );


        /* Check */

        if (inCheck(
                &game,
                game.whiteTurn)) {

            if (game.whiteTurn)
                printf(
                    "\n*** WHITE IS IN CHECK ***\n"
                );
            else
                printf(
                    "\n*** BLACK IS IN CHECK ***\n"
                );
        }


        if (checkGameOver(
                &game))
            break;


        printf("\n");


        if (game.whiteTurn)
            printf(
                "WHITE TURN\n"
            );
        else
            printf(
                "BLACK TURN\n"
            );


        /*
        Computer controls Black.
        */

        if (mode == 2 &&
            !game.whiteTurn) {

            printf(
                "\nComputer is thinking...\n"
            );


            Move ai =
                computerMove(
                    &game,
                    aiDepth
                );


            printf(
                "Computer played: "
            );

            printMove(ai);

            printf("\n");


            if (historyCount <
                MAX_HISTORY) {

                history[
                    historyCount
                ].state = game;

                history[
                    historyCount
                ].move = ai;

                historyCount++;
            }


            makeMove(
                &game,
                ai
            );


        } else {

            int result =
                humanTurn(
                    &game,
                    history,
                    &historyCount
                );


            if (result == -1) {

                printf(
                    "\nLeaving game...\n"
                );

                break;
            }
        }
    }
}


/* =========================================================
   PROGRAM ENTRY
   ========================================================= */

int main() {

    srand(
        (unsigned)time(NULL)
    );


    while (1) {

        int choice =
            menu();


        if (choice == 1) {

            playGame(
                1,
                0
            );

        }


        else if (choice == 2) {

            playGame(
                2,
                0
            );

        }


        else if (choice == 3) {

            playGame(
                2,
                1
            );

        }


        else if (choice == 4) {

            instructions();

        }


        else if (choice == 5) {

            printf(
                "\nGoodbye! ♟\n"
            );

            break;

        }


        else {

            printf(
                "\nInvalid choice.\n"
            );
        }
    }


    return 0;
}     